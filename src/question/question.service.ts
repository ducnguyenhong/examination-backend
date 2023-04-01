import { Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';
import { NO_EXECUTE_PERMISSION } from 'src/constant/response-code';
import { BaseUserDto } from 'src/user/dto/base-user.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question, QuestionDocument } from './schemas/question.schema';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private readonly model: Model<QuestionDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(): Promise<Question[]> {
    return await this.model.find({ status: 'ACTIVE' }).exec();
  }

  async findOne(id: string): Promise<Question> {
    return await this.model.findById(id).exec();
  }

  async create(
    createQuestionDto: CreateQuestionDto,
    authUser: BaseUserDto,
  ): Promise<Question> {
    const { id: authId, role: authRole } = authUser;

    if (!['TEACHER', 'ADMIN'].includes(authRole)) {
      throw new ForbiddenException({
        code: NO_EXECUTE_PERMISSION,
        message: 'No execute permission',
      });
    }

    return await new this.model({
      ...createQuestionDto,
      creatorId: authId,
      createdAt: dayjs().valueOf(),
    }).save();
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    return await this.model
      .findByIdAndUpdate(
        id,
        {
          ...updateQuestionDto,
          updatedAt: dayjs().valueOf(),
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<Question> {
    await this.model.findByIdAndUpdate(id, { status: 'INACTIVE' });
    return null;
  }
}
