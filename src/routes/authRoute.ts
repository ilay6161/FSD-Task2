import express from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import authController from "../controllers/authController";

const router = express.Router();


router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/refresh", authenticate, authController.refreshToken);

router.post('/logout', authenticate, authController.logout);

export default router;
