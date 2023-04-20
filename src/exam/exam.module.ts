import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionModule } from 'src/question/question.module';
import { SubjectModule } from 'src/subject/subject.module';
import { TopicModule } from 'src/topic/topic.module';
import { UserModule } from 'src/user/user.module';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { Exam, ExamSchema } from './schemas/exam.schema';

@Module({
  providers: [ExamService],
  controllers: [ExamController],
  imports: [
    MongooseModule.forFeature([{ name: Exam.name, schema: ExamSchema }]),
    UserModule,
    TopicModule,
    QuestionModule,
    SubjectModule,
  ],
  exports: [ExamService],
})
export class ExamModule {}
