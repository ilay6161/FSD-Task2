import express from "express";
import commentController from "../controllers/commentController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authenticate, commentController.addComment);

router.get("/", authenticate, commentController.getAllComments);

router.get("/post", authenticate, commentController.getCommentsByPost);

router.get("/:id", authenticate, commentController.getCommentById);

router.put("/:id", authenticate, commentController.updateComment);

router.delete("/:id", authenticate, commentController.deleteComment);

export default router;
