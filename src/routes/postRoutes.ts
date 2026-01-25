import { Router } from "express";
import {
  addPost,
  getPosts,
  getPostById,
  updatePost,
} from "../controllers/postController";

const router = Router();

router.post("/", addPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.put("/:id", updatePost);

export default router;
