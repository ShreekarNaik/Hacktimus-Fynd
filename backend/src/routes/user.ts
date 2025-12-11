import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
} from "../controllers/userController";

const router = Router();

router.get("/profile", getUserProfile);
router.get("/:userId", getUserProfile);
router.put("/profile", updateUserProfile);
router.post("/delete", deleteUser);

export default router;
