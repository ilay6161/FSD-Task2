import express from "express";
import postController from "../controllers/postController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authenticate, postController.addPost);

router.get("/", authenticate, postController.getPosts);

router.get("/:id", authenticate, postController.getPostById);

router.put("/:id", authenticate, postController.updatePost);

router.delete("/:id", authenticate, postController.deletePost);

export default router;
