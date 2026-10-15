import { Router } from "express";
import { register, login, logout, getAllUsers, getUserById } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/", getAllUsers);
router.get("/:id", getUserById);


export default router;