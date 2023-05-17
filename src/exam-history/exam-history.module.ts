import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamModule } from 'src/exam/exam.module';
import { SubjectModule } from 'src/subject/subject.module';
import { ExamHistoryController } from './exam-history.controller';
import { ExamHistoryService } from './exam-history.service';
import { ExamHistory, ExamHistorySchema } from './schemas/exam-history.schema';

@Module({
  imports: [
    forwardRef(() => ExamModule),
    MongooseModule.forFeature([
      { name: ExamHistory.name, schema: ExamHistorySchema },
    ]),
    SubjectModule,
  ],
  providers: [ExamHistoryService],
  controllers: [ExamHistoryController],
  exports: [ExamHistoryService],
})
export class ExamHistoryModule {}
