import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';
import get from 'lodash/get';
import { Model } from 'mongoose';
import { AES_SECRET_KEY_PASSWORD } from 'src/constant';
import {
  NO_EXECUTE_PERMISSION,
  PASSWORD_IS_REQUIRED,
  USER_ALREADY_EXISTS,
} from 'src/constant/response-code';
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

  async findOneWithAccessToken(authorization: string): Promise<User> {
    const accessToken = authorization.replace('Bearer ', '');
    const currentUserDecode = await this.jwtService.decode(accessToken);
    const username = get(currentUserDecode, 'username');
    const currentUser = await this.model.findOne({ username });
    const { password, _id, ...rest } = currentUser.toObject();
    return { id: _id, ...rest };
  }

  async create(
    createUserDto: CreateUserDto,
    authorization: string,
  ): Promise<User> {
    const accessToken = authorization.replace('Bearer ', '');
    const authUserDecode = await this.jwtService.decode(accessToken);
    const authRole = get(authUserDecode, 'role');
    const { role, password, username } = createUserDto;
    if (!password) {
      throw new HttpException(
        {
          message: 'Password is required',
          code: PASSWORD_IS_REQUIRED,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (role === 'ADMIN' || (role === 'TEACHER' && authRole !== 'ADMIN')) {
      throw new HttpException(
        {
          message: 'No execute permission',
          code: NO_EXECUTE_PERMISSION,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const existsUsername = await this.model.findOne({ username });

    if (!!existsUsername) {
      throw new HttpException(
        {
          message: 'User already exists',
          code: USER_ALREADY_EXISTS,
        },
        HttpStatus.CONFLICT,
      );
    }

    const encryptPassword = CryptoJS.AES.encrypt(
      `${password}`,
      AES_SECRET_KEY_PASSWORD,
    ).toString();

    return await new this.model({
      ...createUserDto,
      password: encryptPassword,
      createdAt: dayjs().valueOf(),
    })
      .save()
      .then((response) => {
        const { password, _id, __v, ...rest } = response.toObject();
        return { id: _id, ...rest };
      });
  }

  async checkExistsUsername(username: string): Promise<boolean> {
    const existsUsername = await this.model.findOne({ username });
    return !!existsUsername;
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
