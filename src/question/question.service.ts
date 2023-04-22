import { Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import identity from 'lodash/identity';
import pickBy from 'lodash/pickBy';
import { Model } from 'mongoose';
import { NO_EXECUTE_PERMISSION } from 'src/constant/response-code';
import { TopicService } from 'src/topic/topic.service';
import { BaseUserDto } from 'src/user/dto/base-user.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question, QuestionDocument } from './schemas/question.schema';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private readonly model: Model<QuestionDocument>,
    private readonly topicService: TopicService,
  ) {}

  async findAll(query: Record<string, unknown>): Promise<any> {
    const {
      page,
      size,
      keyword = '',
      creatorId,
      random,
      subjectId,
      level,
    } = query || {};

    const pageQuery = Number(page) || 1;
    const sizeQuery = Number(size) || 10;

    const queryDb = pickBy(
      {
        status: 'ACTIVE',
        title: { $regex: '.*' + keyword + '.*' },
        creatorId,
        subjectId,
        level,
      },
      identity,
    );
    const numOfItem = await this.model.count(queryDb);

    let dataList = [];

    if (random) {
      dataList = await this.model.aggregate([
        { $match: queryDb },
        { $sample: { size: sizeQuery } },
      ]);
    } else {
      dataList = await this.model
        .find(queryDb)
        .limit(sizeQuery)
        .skip(pageQuery > 1 ? (pageQuery - 1) * sizeQuery : 0);
    }

    const questionList = await Promise.all(
      dataList.map(async (item) => {
        const { topicId = '', _id, __v, ...rest } = item.toObject();
        const topic = await this.topicService.findOne(topicId);
        return {
          ...rest,
          id: _id,
          topicId,
          topicTitle: topic?.title,
        };
      }),
    );

    return {
      data: questionList,
      pagination: {
        page: pageQuery,
        size: sizeQuery,
        total: numOfItem,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const question = await this.model.findOne({ _id: id }).exec();
    const { topicId = '', _id, __v, ...rest } = question.toObject();
    const topic = await this.topicService.findOne(topicId);

    return {
      ...rest,
      id: _id,
      topicId,
      topicTitle: topic?.title,
    };
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
      status: 'ACTIVE',
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

  async delete(id: string, authUser: BaseUserDto): Promise<Question> {
    const { role: authRole, id: authId } = authUser;
    const question = await this.model.findById(id);

    if (
      (authRole === 'TEACHER' && question.creatorId !== authId) ||
      authRole === 'STUDENT'
    ) {
      throw new ForbiddenException({
        code: NO_EXECUTE_PERMISSION,
        message: 'No execute permission',
      });
    }
    await this.model.findByIdAndUpdate(id, { status: 'INACTIVE' });
    return null;
  }
}
