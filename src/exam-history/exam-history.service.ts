import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import identity from 'lodash/identity';
import orderBy from 'lodash/orderBy';
import pickBy from 'lodash/pickBy';
import { Model } from 'mongoose';
import { NO_EXECUTE_PERMISSION } from 'src/constant/response-code';
import { ExamService } from 'src/exam/exam.service';
import { SubjectService } from 'src/subject/subject.service';
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
    private readonly subjectService: SubjectService,
  ) {}

  async findAll(query: Record<string, unknown>): Promise<any> {
    const { page, size, keyword = '', studentId } = query || {};

    const pageQuery = Number(page) || 1;
    const sizeQuery = Number(size) || 10;
    const queryDb = pickBy(
      { status: 'ACTIVE', title: { $regex: '.*' + keyword + '.*' }, studentId },
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

  async statistic(
    query: Record<string, unknown>,
    authUser: BaseUserDto,
  ): Promise<any> {
    const { subjectId } = query || {};
    const { id: authId } = authUser || {};
    let subjectList = await this.subjectService.findAll();
    const queryDb = pickBy({ status: 'ACTIVE', studentId: authId }, identity);

    const historyList = await this.model.find(queryDb);

    if (subjectId) {
      subjectList = subjectList?.data?.filter(
        (i) => i?.toObject()?._id?.toString() === subjectId,
      );
    } else {
      subjectList = subjectList?.data;
    }

    const statisticList = subjectList?.map((item) => {
      const { _id, label } = item.toObject();

      const historyBySubject = orderBy(
        historyList?.filter((i) => i.subjectId === _id.toString()),
        'startedAt',
        'desc',
      );

      const scoreList = historyBySubject?.map((i) => i.score) || [];
      const averageScore = scoreList.length
        ? Number(
            (scoreList.reduce((a, b) => a + b, 0) / scoreList.length).toFixed(
              2,
            ),
          )
        : 0;

      const maxScore = Math.max(...scoreList);
      const minScore = Math.min(...scoreList);

      return {
        subjectName: label,
        subjectId: _id,
        examHistory: historyBySubject?.map((i) => ({
          score: i.score,
          startedAt: i.startedAt,
          id: i._id,
        })),
        maxScore: {
          score: maxScore,
          ids: historyBySubject
            ?.filter((i) => i.score === maxScore)
            ?.map((i) => i._id),
        },
        averageScore,
        minScore: {
          score: minScore,
          ids: historyBySubject
            ?.filter((i) => i.score === minScore)
            ?.map((i) => i._id),
        },
      };
    });

    return statisticList;
  }

  async findOne(id: string): Promise<ExamHistory> {
    return await this.model.findById(id).exec();
  }

  async findOneByQuery(query: any): Promise<ExamHistory> {
    return await this.model
      .findOne(query, {}, { sort: { createdAt: -1 } })
      .exec();
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

    await this.examService.update(
      examId,
      {
        numOfUse: exam.numOfUse + 1,
        updatedAt: dayjs().valueOf(),
      },
      { isInternal: true },
    );

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
