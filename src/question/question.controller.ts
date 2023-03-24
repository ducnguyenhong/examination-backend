import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response.interceptor';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionService } from './question.service';

@Controller('questions')
export class QuestionController {
  constructor(private readonly service: QuestionService) {}

  @UseInterceptors(FormatResponseInterceptor)
  @Get()
  async index() {
    return await this.service.findAll();
  }

  @UseInterceptors(FormatResponseInterceptor)
  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @UseInterceptors(FormatResponseInterceptor)
  @Post()
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Headers() headers,
  ) {
    return await this.service.create(createQuestionDto, headers.authorization);
  }

  @UseInterceptors(FormatResponseInterceptor)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.service.update(id, updateQuestionDto);
  }

  @UseInterceptors(FormatResponseInterceptor)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
