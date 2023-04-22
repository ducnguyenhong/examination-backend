import { Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import identity from 'lodash/identity';
import pickBy from 'lodash/pickBy';
import { Model } from 'mongoose';
import { NO_EXECUTE_PERMISSION } from 'src/constant/response-code';
import { QuestionService } from 'src/question/question.service';
import { SubjectService } from 'src/subject/subject.service';
import { TopicService } from 'src/topic/topic.service';
import { BaseUserDto } from 'src/user/dto/base-user.dto';
import { UserService } from 'src/user/user.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam, ExamDocument } from './schemas/exam.schema';

interface QueryFindAll {
  page?: number | string;
  size?: number | string;
  keyword?: number | string;
  creatorId?: string;
  subjectId?: string;
  sort?: string;
}

@Injectable()
export class ExamService {
  constructor(
    @InjectModel(Exam.name) private readonly model: Model<ExamDocument>,
    private readonly userService: UserService,
    private readonly topicService: TopicService,
    private readonly questionService: QuestionService,
    private readonly subjectService: SubjectService,
  ) {}

  async findAll(query: QueryFindAll): Promise<any> {
    const {
      page,
      size,
      keyword = '',
      creatorId,
      subjectId,
      sort,
    } = query || {};

    const pageQuery = Number(page) || 1;
    const sizeQuery = Number(size) || 10;
    const queryDb = pickBy(
      {
        status: 'ACTIVE',
        title: { $regex: '.*' + keyword + '.*' },
        creatorId,
        subjectId,
      },
      identity,
    );
    const querySort = {};
    if (sort) {
      const [field, type] = sort.split(' ');
      if (type === 'asc') {
        querySort[field] = 1;
      }
      if (type === 'desc') {
        querySort[field] = -1;
      }
    }

    const numOfItem = await this.model.count(queryDb);

    const dataList = await this.model
      .find(queryDb)
      .sort(querySort)
      .limit(sizeQuery)
      .skip(pageQuery > 1 ? pageQuery * sizeQuery : 0);

    const examList = await Promise.all(
      dataList.map(async (item) => {
        const { creatorId, ...rest } = item.toObject();
        const creator = await this.userService.findOne(creatorId);
        return {
          ...rest,
          creatorId,
          creatorFullName: creator.fullName,
        };
      }),
    );

    return {
      data: examList,
      pagination: {
        page: pageQuery,
        size: sizeQuery,
        total: numOfItem,
      },
    };
  }

  async findOne(id: string): Promise<Exam> {
    return await this.model.findById(id).exec();
  }

  async create(
    createExamDto: CreateExamDto,
    authUser: BaseUserDto,
  ): Promise<Exam> {
    const { id: authId, role: authRole } = authUser;

    if (authRole === 'STUDENT') {
      throw new ForbiddenException({
        code: NO_EXECUTE_PERMISSION,
        message: 'No execute permission',
      });
    }

    const response = await new this.model({
      ...createExamDto,
      creatorId: authId,
      createdAt: dayjs().valueOf(),
      status: 'ACTIVE',
      numOfUse: 0,
      publishAt: createExamDto?.publishAt || dayjs().valueOf(),
    }).save();
    const currentCreator = await this.userService.findOne(authId);
    const oldNumOfExam = currentCreator.numOfExam || 0;
    await this.userService.update(
      authId,
      {
        numOfExam: oldNumOfExam + 1,
      },
      authUser,
    );

    return response;
  }

  async createRandom(subjectId: string, authUser: BaseUserDto): Promise<any> {
    const { id: authId } = authUser;

    const subject = await this.subjectService.findOne(subjectId);

    const topics = await this.topicService.findAll({ subjectId });

    let questionIds = [];

    await Promise.all(
      topics?.data?.map(async (item) => {
        const { numOfLevel1, numOfLevel2, numOfLevel3, numOfLevel4 } = item;

        const queryQuestionLv1 = await this.questionService.findAll({
          subjectId,
          level: 1,
          random: true,
          size: numOfLevel1,
        });
        const questionLv1 = queryQuestionLv1?.data || [];

        const queryQuestionLv2 = await this.questionService.findAll({
          subjectId,
          level: 2,
          random: true,
          size: numOfLevel2,
        });
        const questionLv2 = queryQuestionLv2?.data || [];

        const queryQuestionLv3 = await this.questionService.findAll({
          subjectId,
          level: 3,
          random: true,
          size: numOfLevel3,
        });
        const questionLv3 = queryQuestionLv3?.data || [];

        const queryQuestionLv4 = await this.questionService.findAll({
          subjectId,
          level: 4,
          random: true,
          size: numOfLevel4,
        });
        const questionLv4 = queryQuestionLv4?.data || [];

        questionIds = [
          ...questionLv1,
          ...questionLv2,
          ...questionLv3,
          ...questionLv4,
        ]
          .map((i) => i._id)
          .slice(0, subject.questionNumber);
      }),
    );

    return {
      title: `Đề thi ngẫu nhiên môn ${subject.label}`,
      subjectId,
      questionIds,
      password: '',
      status: 'ACTIVE',
      creatorId: authId,
    };
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

  async delete(id: string, authUser: BaseUserDto): Promise<Exam> {
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
