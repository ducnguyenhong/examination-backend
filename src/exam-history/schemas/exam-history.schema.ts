import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamHistoryDocument = ExamHistory & Document;

@Schema()
export class ExamHistory {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  studentId: string;

  @Prop({ required: true })
  result: { questionId: string; answer: string }[];

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  startedAt: number;

  @Prop({ required: true })
  periodTime: number;

  @Prop()
  examId?: string;

  @Prop({ required: true })
  status: 'ACTIVE' | 'INACTIVE';

  @Prop()
  updatedAt?: number;

  @Prop({ required: true })
  createdAt: number;

  @Prop()
  deletedAt?: number;
}

const ExamHistorySchema = SchemaFactory.createForClass(ExamHistory);

ExamHistorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ExamHistorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    delete ret._id;
  },
});

export { ExamHistorySchema };
