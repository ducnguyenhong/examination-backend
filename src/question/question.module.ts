import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { Question, QuestionSchema } from './schemas/question.schema';

@Module({
  providers: [QuestionService],
  controllers: [QuestionController],
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  exports: [QuestionService],
})
export class QuestionModule {}
