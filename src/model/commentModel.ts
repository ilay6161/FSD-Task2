import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  postId: Types.ObjectId;
  content: string;
  senderId: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  content: { type: String, required: true },
  senderId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IComment>('Comment', commentSchema);
