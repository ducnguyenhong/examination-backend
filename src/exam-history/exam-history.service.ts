import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import identity from 'lodash/identity';
import pickBy from 'lodash/pickBy';
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
    @Inject(forwardRef(() => ExamService))
    private readonly examService: ExamService,
  ) {}

  async findAll(query: Record<string, unknown>): Promise<any> {
    const { page, size, keyword = '' } = query || {};

    const pageQuery = Number(page) || 1;
    const sizeQuery = Number(size) || 10;
    const queryDb = pickBy(
      { status: 'ACTIVE', title: { $regex: '.*' + keyword + '.*' } },
      identity,
    );
    const numOfItem = await this.model.count(queryDb);

    const dataList = await this.model
      .find(queryDb)
      .limit(sizeQuery)
      .skip(pageQuery > 1 ? (pageQuery - 1) * sizeQuery : 0);

    return {
      data: dataList,
      pagination: {
        page: pageQuery,
        size: sizeQuery,
        total: numOfItem,
      },
    };
  }

  async findOne(id: string): Promise<ExamHistory> {
    return await this.model.findById(id).exec();
  }

  async findOneByQuery(query: any): Promise<ExamHistory> {
    return await this.model.findOne(query).exec();
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
    const exam = await this.examService.findOne(examId);
    const title = examId ? exam.title : 'Đề thi ngẫu nhiên';

    const response = await new this.model({
      ...createExamHistoryDto,
      title,
      studentId: authId,
      createdAt: dayjs().valueOf(),
      status: 'ACTIVE',
    }).save();

    await this.examService.update(examId, {
      numOfUse: exam.numOfUse + 1,
      updatedAt: dayjs().valueOf(),
    });

    return response;
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
