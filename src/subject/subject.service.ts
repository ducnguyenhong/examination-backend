import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import identity from 'lodash/identity';
import pickBy from 'lodash/pickBy';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject.name) private readonly model: Model<SubjectDocument>,
  ) {}

  async findAll(query: Record<string, unknown>): Promise<any> {
    const { page, size, keyword = '' } = query || {};

    const pageQuery = Number(page) || 1;
    const sizeQuery = Number(size) || 10;
    const queryDb = pickBy(
      { label: { $regex: '.*' + keyword + '.*' } },
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

  async findOne(id: string): Promise<Subject> {
    return await this.model.findOne({ _id: id }).exec();
  }

  // async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
  //   return await new this.model({
  //     ...createSubjectDto,
  //     createdAt: dayjs().valueOf(),
  //     status: 'ACTIVE',
  //   }).save();
  // }

  // async update(
  //   id: string,
  //   updateSubjectDto: UpdateSubjectDto,
  // ): Promise<Subject> {
  //   return await this.model
  //     .findByIdAndUpdate(id, {
  //       ...updateSubjectDto,
  //       updatedAt: dayjs().valueOf(),
  //     })
  //     .exec();
  // }

  // async delete(id: string): Promise<Subject> {
  //   await this.model.findByIdAndUpdate(id, { status: 'INACTIVE' });
  //   return null;
  // }
}
