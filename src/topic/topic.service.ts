import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import identity from 'lodash/identity';
import pickBy from 'lodash/pickBy';
import { Model } from 'mongoose';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic, TopicDocument } from './schemas/topic.schema';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private readonly model: Model<TopicDocument>,
  ) {}

  async findAll(query: Record<string, unknown>): Promise<any> {
    const { page, size, keyword = '', subjectId } = query || {};

    const pageQuery = Number(page) || 1;
    const sizeQuery = Number(size) || 10;
    const queryDb = pickBy(
      { title: { $regex: '.*' + keyword + '.*' }, subjectId },
      identity,
    );
    const numOfItem = await this.model.count(queryDb);

    const dataList = await this.model
      .find(queryDb)
      .limit(sizeQuery)
      .skip(pageQuery > 1 ? (pageQuery - 1) * sizeQuery : 0)
      .sort({ order: 1 });

    return {
      data: dataList,
      pagination: {
        page: pageQuery,
        size: sizeQuery,
        total: numOfItem,
      },
    };
  }

  async findOne(id: string): Promise<Topic> {
    if (!id) {
      return null;
    }

    return await this.model.findOne({ _id: id }).exec();
  }

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    return await new this.model({
      ...createTopicDto,
      createdAt: dayjs().valueOf(),
      status: 'ACTIVE',
    }).save();
  }

  async update(id: string, updateTopicDto: UpdateTopicDto): Promise<Topic> {
    return await this.model
      .findByIdAndUpdate(id, {
        ...updateTopicDto,
        updatedAt: dayjs().valueOf(),
      })
      .exec();
  }

  async delete(id: string): Promise<Topic> {
    await this.model.findByIdAndUpdate(id, { status: 'INACTIVE' });
    return null;
  }
}
