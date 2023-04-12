import { Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import identity from 'lodash/identity';
import pickBy from 'lodash/pickBy';
import { Model } from 'mongoose';
import { NO_EXECUTE_PERMISSION } from 'src/constant/response-code';
import { BaseUserDto } from 'src/user/dto/base-user.dto';
import { UserService } from 'src/user/user.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam, ExamDocument } from './schemas/exam.schema';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel(Exam.name) private readonly model: Model<ExamDocument>,
    private readonly userService: UserService,
  ) {}

  async findAll(query: Record<string, unknown>): Promise<any> {
    const { page, size, keyword = '', creatorId } = query || {};

    const pageQuery = Number(page) || 1;
    const sizeQuery = Number(size) || 10;
    const queryDb = pickBy(
      {
        status: 'ACTIVE',
        title: { $regex: '.*' + keyword + '.*' },
        creatorId,
      },
      identity,
    );
    const numOfItem = await this.model.count(queryDb);

    const dataList = await this.model
      .find(queryDb)
      .limit(sizeQuery)
      .skip(pageQuery > 1 ? pageQuery * sizeQuery : 0);

    return {
      data: dataList,
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

    if (authRole !== 'TEACHER') {
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
