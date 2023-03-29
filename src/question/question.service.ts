import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import get from 'lodash/get';
import { Model } from 'mongoose';
import { NO_EXECUTE_PERMISSION } from 'src/constant/response-code';
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
    return await this.model.find().exec();
  }

  async findOne(id: string): Promise<Question> {
    return await this.model.findById(id).exec();
  }

  async create(
    createQuestionDto: CreateQuestionDto,
    authorization: string,
  ): Promise<Question> {
    const accessToken = authorization.replace('Bearer ', '');
    const authUserDecode = await this.jwtService.decode(accessToken);
    const authRole = get(authUserDecode, 'role');
    const authId = get(authUserDecode, 'id');

    if (!['TEACHER', 'ADMIN'].includes(authRole)) {
      throw new HttpException(
        {
          message: 'No execute permission',
          code: NO_EXECUTE_PERMISSION,
        },
        HttpStatus.FORBIDDEN,
      );
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
    return await this.model.findByIdAndDelete(id).exec();
  }
}
