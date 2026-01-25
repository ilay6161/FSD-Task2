import { Response } from "express";
import Comment from "../model/commentModel";
import Post from "../model/postModel";
import User from "../model/userModel";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";

const sendError = (code: number, message: string, res: Response) => {
  return res.status(code).json({ message });
};

const doesPostExists = async (postId: string, res: Response) => {
  if (!Types.ObjectId.isValid(postId)) {
    sendError(400, "Invalid post ID format", res);
    return false;
  }

  const exists = await Post.exists({ _id: new Types.ObjectId(postId) });
  if (!exists) {
    sendError(404, `Post with ID "${postId}" does not exist`, res);
    return false;
  }
  return true;
};

const doesCommentExists = async (commentId: string, res: Response) => {
  if (!Types.ObjectId.isValid(commentId)) {
    sendError(400, "Invalid comment ID format", res);
    return null;
  }

  const comment = await Comment.findById(new Types.ObjectId(commentId));
  if (!comment) {
    sendError(404, `Comment with ID "${commentId}" does not exist`, res);
    return null;
  }
  return comment;
};

const isOwner = (userId: string, comment: any): boolean => {
  return userId === comment.userId.toString();
};

const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId, content } = req.body;

    if (!req.user?._id) {
      return sendError(401, "Unauthorized", res);
    }
    if (!postId || !content?.trim()) {
      return sendError(400, "postId and content are required", res);
    }
    if (!(await doesPostExists(postId, res))) {
      return;
    }

    const comment = await Comment.create({ postId, userId: req.user._id, content });
    const resComment = await Comment.findById(comment._id);
    return res.status(201).json(resComment);
  } catch (err: any) {
    sendError(500, err.message || "Error creating comment", res);
  }
};

const getAllComments = async (req: AuthRequest, res: Response) => {
  try {
    const comments = await Comment.find();

    res.status(200).json(comments);
  } catch (err: any) {
    sendError(500, err.message || "Error fetching comments", res);
  }
};

const getCommentsByPost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.query.postId as string;
    if (!postId) {
      return sendError(400, "postId is required", res);
    }

    const exists = await doesPostExists(postId, res);
    if (!exists) {
      return;
    }

    const comments = await Comment.find({ postId });

    res.status(200).json(comments);
  } catch (err: any) {
    sendError(500, err.message || "Error fetching comments", res);
  }
};

const getCommentById = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id as string;
    const comment = await doesCommentExists(commentId, res);
    if (!comment) {
      return;
    }

    const resComment = await Comment.findById(comment._id);

    return res.status(200).json(resComment);
  } catch (err: any) {
    sendError(500, err.message || "Error fetching comment", res);
  }
};

const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id as string;
    const { content } = req.body;

    if (!content?.trim()) {
      return sendError(400, "Content cannot be empty", res);
    }

    const comment = await doesCommentExists(commentId, res);

    if (!comment) {
      return;
    }

    if (!req.user?._id || !isOwner(req.user._id, comment)) {
      return sendError(403, "Forbidden: cannot edit this comment", res);
    }

    comment.content = content;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id);
    return res.status(200).json(updatedComment);
  } catch (err: any) {
    sendError(500, err.message || "Error updating comment", res);
  }
};

const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id as string;
    const comment = await doesCommentExists(commentId, res);

    if (!comment) {
      return;
    }

    if (!req.user?._id || !isOwner(req.user._id, comment)) {
      return sendError(403, "Forbidden: cannot delete this comment", res);
    }

    await comment.deleteOne();
    return res.status(200).json(comment);
  } catch (err: any) {
    sendError(500, err.message || "Error deleting comment", res);
  }
};


export default {
  addComment,
  getAllComments,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment
};
