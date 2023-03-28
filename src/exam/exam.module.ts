import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { Exam, ExamSchema } from './schemas/exam.schema';

@Module({
  providers: [ExamService],
  controllers: [ExamController],
  imports: [
    MongooseModule.forFeature([{ name: Exam.name, schema: ExamSchema }]),
    JwtModule,
  ],
  exports: [ExamService],
})
export class ExamModule {}
