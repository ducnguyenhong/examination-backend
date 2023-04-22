import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';

@Module({
  providers: [SubjectService],
  controllers: [SubjectController],
  imports: [
    MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }]),
  ],
  exports: [SubjectService],
})
export class SubjectModule {}
