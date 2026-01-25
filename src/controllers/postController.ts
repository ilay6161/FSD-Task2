import { Response } from "express";
import Post from "../model/postModel";
import User from "../model/userModel";
import { Types } from "mongoose";
import { AuthRequest } from "../middlewares/authMiddleware";

const sendError = (code: number, message: string, res: Response) => {
  return res.status(code).json({ message });
};

const doesPostExist = async (postId: string, res: Response) => {
  if (!Types.ObjectId.isValid(postId)) {
    sendError(400, "Invalid post ID format", res);
    return null;
  }

  const post = await Post.findById(new Types.ObjectId(postId));
  if (!post) {
    sendError(404, `Post with ID "${postId}" does not exist`, res);
    return null;
  }
  return post;
};

const doesUserExist = async (userId: string, res: Response) => {
  if (!Types.ObjectId.isValid(userId)) {
    sendError(400, "Invalid user ID format", res);
    return false;
  }

  const exists = await User.exists({ _id: new Types.ObjectId(userId) });
  if (!exists) {
    sendError(404, `User with ID "${userId}" does not exist`, res);
    return false;
  }
  return true;
};

const isOwner = (userId: string, post: any): boolean => {
  return userId === post.senderId.toString();
};

const addPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return sendError(400, "title and content are required", res);
    }
    if (!req.user?._id) {
      return sendError(401, "Unauthorized", res);
    }

    const post = await Post.create({ title, content, senderId: req.user._id });
    return res.status(201).json(post);
  } catch (err: any) {
    sendError(500, err.message || "Error creating post", res);
  }
};

const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.query.sender as string | undefined;

    if (senderId) {
      if (!(await doesUserExist(senderId, res))) {
        return;
      }

      const senderObjectId = new Types.ObjectId(senderId);
      const posts = await Post.find({ senderId: senderObjectId });
      return res.status(200).json(posts);
    }

    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err: any) {
    sendError(500, err.message || "Error fetching posts", res);
  }
};

const getPostById = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id as string;
    const post = await doesPostExist(postId, res);

    if (!post) {
      return;
    }

    return res.status(200).json(post);
  } catch (err: any) {
    sendError(500, err.message || "Error fetching post", res);
  }
};

const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    const postId = req.params.id as string;
    const post = await doesPostExist(postId, res);

    if (!post) {
      return;
    }

    if (!req.user?._id || !isOwner(req.user._id, post)) {
      return sendError(403, "Forbidden: cannot edit this post", res);
    }

    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();

    return res.status(200).json(post);
  } catch (err: any) {
    sendError(500, err.message || "Error updating post", res);
  }
};

const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id as string;
    const post = await doesPostExist(postId, res);

    if (!post) {
      return;
    }

    if (!req.user?._id || !isOwner(req.user._id, post)) {
      return sendError(403, "Forbidden: cannot delete this post", res);
    }

    await post.deleteOne();
    return res.status(200).json(post);
  } catch (err: any) {
    sendError(500, err.message || "Error deleting post", res);
  }
};

export default {
  addPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
