import { Router } from "express";
import {
  sendOtp,
  loginWithOtp,
  registerWithOtp,
  checkUsernameAvailability,
} from "../controllers/authController";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/login-otp", loginWithOtp);
router.post("/register", registerWithOtp);
router.get("/check-username", checkUsernameAvailability);

export default router;
