import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './schemas/topic.schema';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';

@Module({
  providers: [TopicService],
  controllers: [TopicController],
  imports: [
    MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),
  ],
})
export class TopicModule {}
