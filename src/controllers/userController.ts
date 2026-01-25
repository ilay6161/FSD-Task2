import { Response } from "express";
import User from "../model/userModel";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";

const sendError = (code: number, message: string, res: Response) => {
  return res.status(code).json({ message });
};

const doesUserExist = async (userId: string, res: Response) => {
  if (!Types.ObjectId.isValid(userId)) {
    sendError(400, "Invalid user ID format", res);
    return null;
  }

  const user = await User.findById(new Types.ObjectId(userId));
  if (!user) {
    sendError(404, `User with ID "${userId}" does not exist`, res);
    return null;
  }
  return user;
};

const getAllUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("-password -refreshTokens");
    res.status(200).json(users);
  } catch (err: any) {
    sendError(500, err.message || "Error fetching users", res);
  }
};

const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id as string;
    const user = await doesUserExist(userId, res);
    if (!user) {
      return;
    }

    const { password, refreshTokens, ...userResponse } = user.toObject();
    res.status(200).json(userResponse);
  } catch (err: any) {
    sendError(500, err.message || "Error fetching user", res);
  }
};

const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id as string;
    const { username, email } = req.body;

    if (!req.user?._id) {
      return sendError(401, "Unauthorized", res);
    }

    if (!Types.ObjectId.isValid(userId)) {
      return sendError(400, "Invalid user ID format", res);
    }

    if (req.user._id.toString() !== userId) {
      return sendError(403, "Forbidden: cannot update another user's profile", res);
    }

    const user = await doesUserExist(userId, res);
    if (!user) {
      return;
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    const { password, refreshTokens, ...userResponse } = user.toObject();
    res.status(200).json(userResponse);
  } catch (err: any) {
    sendError(500, err.message || "Error updating user", res);
  }
};