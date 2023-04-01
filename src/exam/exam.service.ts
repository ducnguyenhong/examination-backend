import { Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';
import { NO_EXECUTE_PERMISSION } from 'src/constant/response-code';
import { BaseUserDto } from 'src/user/dto/base-user.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam, ExamDocument } from './schemas/exam.schema';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel(Exam.name) private readonly model: Model<ExamDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(): Promise<Exam[]> {
    return await this.model.find({ status: 'ACTIVE' }).exec();
  }

  async findOne(id: string): Promise<Exam> {
    return await this.model.findById(id).exec();
  }

  async create(
    createExamDto: CreateExamDto,
    authUser: BaseUserDto,
  ): Promise<Exam> {
    const { id: authId, role: authRole } = authUser;

    if (authRole !== 'TEACHER') {
      throw new ForbiddenException({
        code: NO_EXECUTE_PERMISSION,
        message: 'No execute permission',
      });
    }

    return await new this.model({
      ...createExamDto,
      teacherId: authId,
      createdAt: dayjs().valueOf(),
    }).save();
  }

  async update(id: string, updateExamDto: UpdateExamDto): Promise<Exam> {
    return await this.model
      .findByIdAndUpdate(
        id,
        {
          ...updateExamDto,
          updatedAt: dayjs().valueOf(),
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<Exam> {
    await this.model.findByIdAndUpdate(id, { status: 'INACTIVE' });
    return null;
  }
}
