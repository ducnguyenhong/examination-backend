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
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamService } from './exam.service';

@UseGuards(JwtAuthGuard)
@UseInterceptors(FormatResponseInterceptor)
@Controller('exams')
export class ExamController {
  constructor(private readonly service: ExamService) {}

  @Get()
  async index(@Query() query) {
    return await this.service.findAll(query);
  }

  @Get('random')
  async createRandom(@Request() req) {
    return await this.service.createRandom(req.query?.subjectId, req.user);
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  async create(@Body() createExamDto: CreateExamDto, @Request() req) {
    return await this.service.create(createExamDto, req.user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return await this.service.update(id, updateExamDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return await this.service.delete(id, req.user);
  }
}
