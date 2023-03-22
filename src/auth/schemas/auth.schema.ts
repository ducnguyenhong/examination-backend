import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema()
export class Auth {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  expiredAt: string;

  @Prop({ required: true })
  createdAt: number;

  @Prop()
  updatedAt?: number;
}

const AuthSchema = SchemaFactory.createForClass(Auth);

AuthSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

AuthSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    delete ret._id;
  },
});

export { AuthSchema };
