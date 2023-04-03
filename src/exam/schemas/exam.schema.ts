import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamDocument = Exam & Document;

@Schema()
export class Exam {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true })
  creatorId: string;

  @Prop({ required: true })
  questionIds: string[];

  @Prop()
  password?: string;

  @Prop({ required: true })
  status: 'ACTIVE' | 'INACTIVE';

  @Prop()
  updatedAt?: number;

  @Prop({ required: true })
  createdAt: number;

  @Prop({ required: true })
  publishAt: number;

  @Prop()
  deletedAt?: number;
}

const ExamSchema = SchemaFactory.createForClass(Exam);

ExamSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ExamSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    delete ret._id;
  },
});

export { ExamSchema };
