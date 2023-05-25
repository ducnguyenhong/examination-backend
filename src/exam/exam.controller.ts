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
  async index(@Query() query, @Request() req) {
    return await this.service.findAll(query, req.user);
  }

  @Get('count')
  async count(@Request() req) {
    return await this.service.count(req.query);
  }

  @Get('get-by-date')
  async getByDate(@Request() req) {
    return await this.service.getByDate(req.query);
  }

  @Get('random')
  async generateRandom(@Request() req) {
    return await this.service.generateRandom(req.query?.subjectId, req.user);
  }

  @Get(':id')
  async find(@Param('id') id: string, @Request() req) {
    return await this.service.findOne(id, req.user);
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
