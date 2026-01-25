import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  senderId: Types.ObjectId;
  createdAt: Date;
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IPost>('Post', postSchema);
