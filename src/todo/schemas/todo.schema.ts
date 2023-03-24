import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema()
export class Todo {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  updatedAt?: number;

  @Prop({ required: true })
  createdAt: number;

  @Prop()
  deletedAt?: number;
}

const TodoSchema = SchemaFactory.createForClass(Todo);

TodoSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TodoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    delete ret._id;
  },
});

export { TodoSchema };
