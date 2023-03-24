import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';
import get from 'lodash/get';
import { Model } from 'mongoose';
import { AES_SECRET_KEY_PASSWORD } from 'src/constant';
import { USERNAME_OR_PASSWORD_INCORRECT } from 'src/constant/response-code';
import { UserService } from '../user/user.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Auth, AuthDocument } from './schemas/auth.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private readonly model: Model<AuthDocument>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneWithUsername(username);

    if (user) {
      const bytes = CryptoJS.AES.decrypt(
        user.password,
        AES_SECRET_KEY_PASSWORD,
      );
      const decryptPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (decryptPassword !== pass) {
        throw new HttpException(
          {
            message: 'Username or password incorrect',
            code: USERNAME_OR_PASSWORD_INCORRECT,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(data: any) {
    const { username, role, fullName } = data._doc;
    const payload = { username, role, fullName };
    const expiredAt = dayjs().add(30, 'day').valueOf();
    const accessToken = await this.jwtService.sign(payload);

    const isExistInAuth = await this.model.findOne({ username });
    if (!isExistInAuth) {
      await this.model.create({
        username,
        expiredAt,
        accessToken,
        createdAt: dayjs().valueOf(),
      });
    } else {
      await this.model.findOneAndUpdate(
        { username },
        { username, expiredAt, accessToken, updatedAt: dayjs().valueOf() },
      );
    }

    this.model.create({ username, expiredAt });
    return { accessToken, expiredAt };
  }

  async logout(authorization: string) {
    const accessToken = authorization.replace('Bearer ', '');
    const currentUserDecode = await this.jwtService.decode(accessToken);
    const username = get(currentUserDecode, 'username');
    await this.model.findOneAndDelete({ username });
    return null;
  }

  async findOne(id: string): Promise<Auth> {
    return await this.model.findById(id);
  }

  async findOneWithUsername(username: string): Promise<Auth> {
    return await this.model.findOne({ username }).exec();
  }

  async create(createAuthDto: CreateAuthDto): Promise<Auth> {
    return await new this.model({
      ...createAuthDto,
      createdAt: dayjs().valueOf(),
    }).save();
  }

  async update(id: string, updateAuthDto: UpdateAuthDto): Promise<Auth> {
    return await this.model
      .findByIdAndUpdate(id, {
        ...updateAuthDto,
        updatedAt: dayjs().valueOf(),
      })
      .exec();
  }
}
