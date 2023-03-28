import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamModule } from 'src/exam/exam.module';
import { ExamHistoryController } from './exam-history.controller';
import { ExamHistoryService } from './exam-history.service';
import { ExamHistory, ExamHistorySchema } from './schemas/exam-history.schema';

@Module({
  imports: [
    ExamModule,
    MongooseModule.forFeature([
      { name: ExamHistory.name, schema: ExamHistorySchema },
    ]),
    JwtModule,
  ],
  providers: [ExamHistoryService],
  controllers: [ExamHistoryController],
})
export class ExamHistoryModule {}
