import { Request, Response } from "express";
import Post from "../model/postModel";

const sendError = (code: number, message: string, res: Response) => res.status(code).json({ message });

const addPost = async (req: Request, res: Response) => {
    try {
        const { title, content, senderId } = req.body;
        if (!title || !content || !senderId) {
            return sendError(400, "title, content, and senderId are required", res);
        }
        const post = await Post.create({ title, content, senderId });
        res.status(201).json(post);
    } catch (err: any) {
        sendError(500, err.message || "Error creating post", res);
    }
};

const getPosts = async (req: Request, res: Response) => {
  try {
    const senderId = req.query.sender as string | undefined;

    const posts = senderId
      ? await Post.find({ senderId }).populate("senderId")
      : await Post.find().populate("senderId");

    res.status(200).json(posts);
  } catch (err: any) {
    sendError(500, err.message || "Error fetching posts", res);
  }
};

const getPostById = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id).populate("senderId");
        if (!post) {
            return sendError(404, "Post not found", res);
        }
        res.status(200).json(post);
    } catch (err: any) {
        sendError(500, err.message || "Error fetching post", res);
    }
};

const updatePost = async (req: Request, res: Response) => {
    try {
        const { senderId, title, content } = req.body;

        const post = await Post.findById(req.params.id);
        if (!post) {
            return sendError(404, "Post not found", res);
        }

        if (senderId && senderId !== post.senderId.toString()) {
            return sendError(400, "Cannot change sender of the post", res);
        }
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { title: title || post.title, content: content || post.content },
            { new: true }
        );

        res.status(200).json(updatedPost);
    } catch (err: any) {
        sendError(500, err.message || "Error updating post", res);
    }
};

export { addPost, getPosts, getPostById, updatePost };
