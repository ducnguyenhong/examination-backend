import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import get from 'lodash/get';
import { Model } from 'mongoose';
import { NO_EXECUTE_PERMISSION } from 'src/constant/response-code';
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
    return await this.model.find().exec();
  }

  async findOne(id: string): Promise<Exam> {
    return await this.model.findById(id).exec();
  }

  async create(
    createExamDto: CreateExamDto,
    authorization: string,
  ): Promise<Exam> {
    const accessToken = authorization.replace('Bearer ', '');
    const authUserDecode = await this.jwtService.decode(accessToken);
    const authRole = get(authUserDecode, 'role');
    const authId = get(authUserDecode, 'id');

    if (authRole !== 'TEACHER') {
      throw new HttpException(
        {
          message: 'No execute permission',
          code: NO_EXECUTE_PERMISSION,
        },
        HttpStatus.FORBIDDEN,
      );
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
    return await this.model.findByIdAndDelete(id).exec();
  }
}
