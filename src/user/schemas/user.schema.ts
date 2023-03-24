import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop()
  password?: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';

  @Prop({ required: true })
  createdAt: number;

  @Prop({ required: true })
  status: 'ACTIVE' | 'INACTIVE';

  @Prop()
  subjectIds?: string[];

  @Prop()
  avatar?: string;

  @Prop()
  school?: string;

  @Prop()
  address?: string;

  @Prop()
  phone?: string;

  @Prop()
  gender?: 'MALE' | 'FEMALE';

  @Prop()
  updatedAt?: number;

  @Prop()
  deletedAt?: number;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    delete ret._id;
  },
});

export { UserSchema };
