import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';
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
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username };
    return {
      accessToken: this.jwtService.sign(payload),
    };
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
