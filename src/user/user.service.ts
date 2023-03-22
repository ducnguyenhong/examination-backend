import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.model.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return await this.model.findById(id);
  }

  async findOneWithUsername(username: string): Promise<User> {
    return await this.model.findOne({ username }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await new this.model({
      ...createUserDto,
      createdAt: dayjs().valueOf(),
    }).save();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.model
      .findByIdAndUpdate(id, {
        ...updateUserDto,
        updatedAt: dayjs().valueOf(),
      })
      .exec();
  }

  async delete(id: string): Promise<User> {
    return await this.model.findByIdAndDelete(id).exec();
  }
}
