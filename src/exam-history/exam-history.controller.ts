import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response.interceptor';
import { CreateExamHistoryDto } from './dto/create-exam-history.dto';
import { ExamHistoryService } from './exam-history.service';

@UseGuards(JwtAuthGuard)
@UseInterceptors(FormatResponseInterceptor)
@Controller('exam-history')
export class ExamHistoryController {
  constructor(private readonly service: ExamHistoryService) {}

  @Get()
  async index(@Query() query) {
    return await this.service.findAll(query);
  }

  @Get('statistic')
  async statistic(@Query() query, @Request() req) {
    return await this.service.statistic(query, req.user);
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  async create(
    @Body() createExamHistoryDto: CreateExamHistoryDto,
    @Request() req,
  ) {
    return await this.service.create(createExamHistoryDto, req.user);
  }

  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateExamHistoryDto: UpdateExamHistoryDto,
  // ) {
  //   return await this.service.update(id, updateExamHistoryDto);
  // }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return await this.service.delete(id);
  // }
}
