import { Schema, model, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  senderId: string;
  createdAt: Date;
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  senderId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IPost>('Post', postSchema);
