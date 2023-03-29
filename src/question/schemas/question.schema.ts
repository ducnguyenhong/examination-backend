import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  answers: { label: string; value: string; isCorrect: boolean }[];

  @Prop({ required: true })
  level: number;

  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true })
  creatorId: string;

  @Prop({ required: true })
  security: boolean;

  @Prop({ required: true })
  status: 'ACTIVE' | 'INACTIVE';

  @Prop()
  explanation: string;

  @Prop()
  updatedAt?: number;

  @Prop({ required: true })
  createdAt: number;

  @Prop()
  deletedAt?: number;
}

const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

QuestionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    delete ret._id;
  },
});

export { QuestionSchema };
