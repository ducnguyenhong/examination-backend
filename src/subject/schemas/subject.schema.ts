import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema()
export class Subject {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  value: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  questionNumber: number;

  @Prop({ required: true })
  time: number; // minute
}

const SubjectSchema = SchemaFactory.createForClass(Subject);

SubjectSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

SubjectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    delete ret._id;
  },
});

export { SubjectSchema };
