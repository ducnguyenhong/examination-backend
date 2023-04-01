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

  async findAll(query: Record<string, unknown>): Promise<any> {
    const { page, size } = query || {};
    const pageQuery = Number(page) || 1;
    const sizeQuery = Number(size) || 10;
    const queryDb = { status: 'ACTIVE' };
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
