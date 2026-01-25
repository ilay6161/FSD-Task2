import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../model/userModel";
import jwt from "jsonwebtoken";

const sendError = (code: number, message: string, res: Response) => {
  res.status(code).json({ message });
};

type GeneratedTokens = { token: string; refreshToken: string };

const generateToken = (userId: string): GeneratedTokens => {
  const secret = process.env.JWT_SECRET || "default_secret";
  const expiresIn = parseInt(process.env.JWT_EXPIRES_IN || "3600");
  const token = jwt.sign({ _id: userId }, secret, { expiresIn });

  const refreshExpiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || "1440");
  const rand = Math.floor(Math.random() * 1000);
  const refreshToken = jwt.sign({ _id: userId, rand }, secret, { expiresIn: refreshExpiresIn });

  return { token, refreshToken };
};

const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return sendError(400, "Username, email and password are required", res);

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, password: hashedPassword });
    const tokens = generateToken(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.status(201).json(tokens);
  } catch (err: any) {
    return sendError(500, err.message || "Internal server error", res);
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return sendError(400, "Email and password are required", res);

  try {
    const user = await User.findOne({ email });
    if (!user) return sendError(401, "Invalid email or password", res);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(401, "Invalid email or password", res);

    const tokens = generateToken(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).json(tokens);
  } catch (err: any) {
    return sendError(500, err.message || "Internal server error", res);
  }
};

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(400, "Refresh token is required", res);

  const secret = process.env.JWT_SECRET || "default_secret";
  try {
    const decoded = jwt.verify(refreshToken, secret) as { _id: string };
    const user = await User.findById(decoded._id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      if (user) { user.refreshTokens = []; await user.save(); }
      return sendError(401, "Invalid refresh token", res);
    }

    const tokens = generateToken(decoded._id);
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).json(tokens);
  } catch (err) {
    return sendError(401, "Invalid refresh token", res);
  }
};

const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return sendError(401, "Authorization token is required", res);

  const refreshToken = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET || "default_secret";

  try {
    const decoded = jwt.verify(refreshToken, secret) as { _id: string };

    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(401, "User not found", res);
    }

    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      message: "Logged out successfully, all sessions cleared"
    });
  } catch (err) {
    return sendError(401, "Invalid or expired token", res);
  }
};



export default { register, login, refreshToken, logout };
