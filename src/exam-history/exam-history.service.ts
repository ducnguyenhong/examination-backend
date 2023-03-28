import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import get from 'lodash/get';
import { Model } from 'mongoose';
import { NO_EXECUTE_PERMISSION } from 'src/constant/response-code';
import { ExamService } from 'src/exam/exam.service';
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
    return await this.model.find().exec();
  }

  async findOne(id: string): Promise<ExamHistory> {
    return await this.model.findById(id).exec();
  }

  async create(
    createExamHistoryDto: CreateExamHistoryDto,
    authorization: string,
  ): Promise<ExamHistory> {
    const accessToken = authorization.replace('Bearer ', '');
    const authUserDecode = await this.jwtService.decode(accessToken);
    const authRole = get(authUserDecode, 'role');
    const authId = get(authUserDecode, 'id');

    if (authRole !== 'STUDENT') {
      throw new HttpException(
        {
          message: 'No execute permission',
          code: NO_EXECUTE_PERMISSION,
        },
        HttpStatus.FORBIDDEN,
      );
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
    return await this.model.findByIdAndDelete(id).exec();
  }
}
