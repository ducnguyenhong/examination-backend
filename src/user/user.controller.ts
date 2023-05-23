import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@UseInterceptors(FormatResponseInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async index(@Query() query) {
    return await this.service.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('following')
  async findFollowing(@Query() query, @Request() req) {
    return await this.service.findFollowing(query, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('count')
  async count(@Query() query) {
    return await this.service.count(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async find(@Param('id') id: string, @Request() req) {
    return await this.service.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return await this.service.create(createUserDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return await this.service.update(id, updateUserDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return await this.service.delete(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('follow')
  async follow(@Body() body: { followIds: string[] }, @Request() req) {
    return await this.service.follow(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfollow')
  async unFollow(@Body() body: { followIds: string[] }, @Request() req) {
    return await this.service.unFollow(body, req.user);
  }
}
