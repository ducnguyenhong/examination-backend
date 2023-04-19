import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TopicDocument = Topic & Document;

@Schema()
export class Topic {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  status: 'ACTIVE' | 'INACTIVE';

  @Prop()
  updatedAt?: number;

  @Prop({ required: true })
  createdAt: number;

  @Prop()
  deletedAt?: number;
}

const TopicSchema = SchemaFactory.createForClass(Topic);

TopicSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TopicSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    delete ret._id;
  },
});

export { TopicSchema };
