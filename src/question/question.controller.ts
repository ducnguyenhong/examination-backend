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
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionService } from './question.service';

@UseGuards(JwtAuthGuard)
@UseInterceptors(FormatResponseInterceptor)
@Controller('questions')
export class QuestionController {
  constructor(private readonly service: QuestionService) {}

  @Get()
  async index(@Query() query) {
    return await this.service.findAll(query);
  }

  @Get('count')
  async count(@Request() req) {
    return await this.service.count(req.query);
  }

  @Get('get-by-date')
  async getByDate(@Request() req) {
    return await this.service.getByDate(req.query);
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  async create(@Body() createQuestionDto: CreateQuestionDto, @Request() req) {
    return await this.service.create(createQuestionDto, req.user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.service.update(id, updateQuestionDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return await this.service.delete(id, req.user);
  }
}
