import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response.interceptor';
import { SubjectService } from './subject.service';

@UseGuards(JwtAuthGuard)
@UseInterceptors(FormatResponseInterceptor)
@Controller('subjects')
export class SubjectController {
  constructor(private readonly service: SubjectService) {}

  @Get()
  async index(@Query() query) {
    return await this.service.findAll(query);
  }

  // @Get(':id')
  // async find(@Param('id') id: string) {
  //   return await this.service.findOne(id);
  // }

  // @Post()
  // async create(@Body() createSubjectDto: CreateSubjectDto) {
  //   return await this.service.create(createSubjectDto);
  // }

  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateSubjectDto: UpdateSubjectDto,
  // ) {
  //   return await this.service.update(id, updateSubjectDto);
  // }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return await this.service.delete(id);
  // }
}
