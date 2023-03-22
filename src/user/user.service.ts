import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import get from 'lodash/get';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
    private readonly jwtService: JwtService,
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

  async findOneWithAccessToken(authorization: string): Promise<any> {
    const accessToken = authorization.replace('Bearer ', '');
    const currentUserDecode = await this.jwtService.decode(accessToken);
    const username = get(currentUserDecode, 'username');
    const currentUser = await this.model.findOne({ username });
    const { password, _id, ...rest } = currentUser.toObject();
    return {
      data: { id: _id, ...rest },
    };
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
