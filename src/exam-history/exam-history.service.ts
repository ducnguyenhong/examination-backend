import { Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';
import { NO_EXECUTE_PERMISSION } from 'src/constant/response-code';
import { ExamService } from 'src/exam/exam.service';
import { BaseUserDto } from 'src/user/dto/base-user.dto';
import { CreateExamHistoryDto } from './dto/create-exam-history.dto';
import { UpdateExamHistoryDto } from './dto/update-exam-history.dto';
import {
  ExamHistory,
  ExamHistoryDocument,
} from './schemas/exam-history.schema';

@Injectable()
export class ExamHistoryService {
  constructor(
    @InjectModel(ExamHistory.name)
    private readonly model: Model<ExamHistoryDocument>,
    private readonly examService: ExamService,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(): Promise<ExamHistory[]> {
    return await this.model.find({ status: 'ACTIVE' }).exec();
  }

  async findOne(id: string): Promise<ExamHistory> {
    return await this.model.findById(id).exec();
  }

  async create(
    createExamHistoryDto: CreateExamHistoryDto,
    authUser: BaseUserDto,
  ): Promise<ExamHistory> {
    const { id: authId, role: authRole } = authUser;

    if (authRole !== 'STUDENT') {
      throw new ForbiddenException({
        code: NO_EXECUTE_PERMISSION,
        message: 'No execute permission',
      });
    }

    const { examId } = createExamHistoryDto;
    let title = '';
    if (!examId) {
      title = 'Đề thi ngẫu nhiên';
    } else {
      const exam = await this.examService.findOne(examId);
      title = exam.title;
    }

    return await new this.model({
      ...createExamHistoryDto,
      title,
      studentId: authId,
      createdAt: dayjs().valueOf(),
    }).save();
  }

  async update(
    id: string,
    updateExamHistoryDto: UpdateExamHistoryDto,
  ): Promise<ExamHistory> {
    return await this.model
      .findByIdAndUpdate(id, {
        ...updateExamHistoryDto,
        updatedAt: dayjs().valueOf(),
      })
      .exec();
  }

  async delete(id: string): Promise<ExamHistory> {
    await this.model.findByIdAndUpdate(id, { status: 'INACTIVE' });
    return null;
  }
}
