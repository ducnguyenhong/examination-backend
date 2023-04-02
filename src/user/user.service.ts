import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';
import { Model } from 'mongoose';
import { AES_SECRET_KEY_PASSWORD } from 'src/constant';
import {
  NO_EXECUTE_PERMISSION,
  PASSWORD_IS_REQUIRED,
  USER_ALREADY_EXISTS,
} from 'src/constant/response-code';
import { BaseUserDto } from './dto/base-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(query: Record<string, unknown>): Promise<any> {
    const { role, page, size } = query || {};
    if (role === 'ADMIN') {
      return [];
    }
    const pageQuery = Number(page) || 1;
    const sizeQuery = Number(size) || 10;
    const queryDb = { role, status: 'ACTIVE' };
    const numOfItem = await this.model.count(queryDb);

    const dataList = await this.model
      .find(queryDb, { password: 0, __v: 0 })
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

  async findOne(id: string): Promise<User> {
    return await this.model.findById(id);
  }

  async findOneWithUsername(username: string): Promise<User> {
    return await this.model.findOne({ username }).exec();
  }

  async findOneWithAccessToken(authUser: BaseUserDto): Promise<User> {
    const { username } = authUser;
    const currentUser = await this.model.findOne({ username }, { password: 0 });

    if (!currentUser) {
      throw new UnauthorizedException();
    }
    return currentUser;
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { role, password, username } = createUserDto || {};

    if (role !== 'STUDENT') {
      throw new ForbiddenException({
        code: NO_EXECUTE_PERMISSION,
        message: 'No execute permission',
      });
    }
    if (!password) {
      throw new HttpException(
        {
          message: 'Password is required',
          code: PASSWORD_IS_REQUIRED,
        },
        HttpStatus.BAD_REQUEST,
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
      status: 'ACTIVE',
    })
      .save()
      .then((response) => {
        const { password, _id, __v, ...rest } = response.toObject();
        return { id: _id, ...rest };
      });
  }

  async create(
    createUserDto: CreateUserDto,
    authUser: BaseUserDto,
  ): Promise<User> {
    const { role, password, username } = createUserDto || {};

    if (role !== 'STUDENT') {
      if (!authUser?.username || role === 'ADMIN') {
        throw new ForbiddenException({
          code: NO_EXECUTE_PERMISSION,
          message: 'No execute permission',
        });
      }

      const { role: authRole } = authUser;
      if (role === 'TEACHER' && authRole !== 'ADMIN') {
        throw new ForbiddenException({
          code: NO_EXECUTE_PERMISSION,
          message: 'No execute permission',
        });
      }
    }
    if (!password) {
      throw new HttpException(
        {
          message: 'Password is required',
          code: PASSWORD_IS_REQUIRED,
        },
        HttpStatus.BAD_REQUEST,
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
      status: 'ACTIVE',
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

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    authUser: BaseUserDto,
  ): Promise<User> {
    if (authUser.id !== id) {
      throw new ForbiddenException({
        code: NO_EXECUTE_PERMISSION,
        message: 'No execute permission',
      });
    }
    return await this.model
      .findByIdAndUpdate(id, {
        ...updateUserDto,
        updatedAt: dayjs().valueOf(),
      })
      .exec();
  }

  async delete(id: string, authUser: BaseUserDto): Promise<User> {
    if (authUser.role !== 'ADMIN') {
      throw new ForbiddenException({
        code: NO_EXECUTE_PERMISSION,
        message: 'No execute permission',
      });
    }
    await this.model.findByIdAndUpdate(id, { status: 'INACTIVE' });
    return null;
  }
}
