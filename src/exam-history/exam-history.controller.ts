import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response.interceptor';
import { CreateExamHistoryDto } from './dto/create-exam-history.dto';
import { ExamHistoryService } from './exam-history.service';

@UseInterceptors(FormatResponseInterceptor)
@Controller('exam-history')
export class ExamHistoryController {
  constructor(private readonly service: ExamHistoryService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  async create(
    @Body() createExamHistoryDto: CreateExamHistoryDto,
    @Headers() headers,
  ) {
    return await this.service.create(
      createExamHistoryDto,
      headers.authorization,
    );
  }

  // @Put(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateExamHistoryDto: UpdateExamHistoryDto,
  // ) {
  //   return await this.service.update(id, updateExamHistoryDto);
  // }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
