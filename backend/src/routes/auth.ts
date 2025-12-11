import { Router } from "express";
import {
  login,
  sendOtp,
  loginWithOtp,
  registerWithOtp,
} from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/login-otp", loginWithOtp);
router.post("/register", registerWithOtp);

export default router;
