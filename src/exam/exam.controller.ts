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
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamService } from './exam.service';

@UseInterceptors(FormatResponseInterceptor)
@Controller('exams')
export class ExamController {
  constructor(private readonly service: ExamService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  async create(@Body() createExamDto: CreateExamDto, @Headers() headers) {
    return await this.service.create(createExamDto, headers.authorization);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return await this.service.update(id, updateExamDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
