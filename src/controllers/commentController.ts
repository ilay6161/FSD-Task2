import { Request, Response } from "express";
import Comment from "../model/commentModel";

const sendError = (code: number, message: string, res: Response) =>
  res.status(code).json({ message });

const addComment = async (req: Request, res: Response) => {
  try {
    const { content, postId, senderId } = req.body;
    if (!content || !postId || !senderId)
      return sendError(400, "content, postId, and senderId are required", res);

    const comment = await Comment.create({ content, postId, senderId });
    res.status(201).json(comment);
  } catch (err: any) {
    sendError(500, err.message || "Error creating comment", res);
  }
};

const getComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find().populate("senderId").populate("postId");
    res.status(200).json(comments);
  } catch (err: any) {
    sendError(500, err.message || "Error fetching comments", res);
  }
};

const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).populate("senderId");
    if (!comments || comments.length === 0) return sendError(404, "No comments found for this post", res);
    res.status(200).json(comments);
  } catch (err: any) {
    sendError(500, err.message || "Error fetching comments", res);
  }
};

const updateComment = async (req: Request, res: Response) => {
  try {
    const { senderId, content } = req.body;

    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(404, "Comment not found", res);

    if (senderId && senderId !== comment.senderId.toString())
      return sendError(400, "Cannot change creator of the comment", res);

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: content || comment.content },
      { new: true }
    );

    res.status(200).json(updatedComment);
  } catch (err: any) {
    sendError(500, err.message || "Error updating comment", res);
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return sendError(404, "Comment not found", res);

    res.status(200).json(comment);
  } catch (err: any) {
    sendError(500, err.message || "Error deleting comment", res);
  }
};

export { addComment, getComments, getCommentsByPost, updateComment, deleteComment };