import express from "express";
const router = express.Router();
import { debugCode } from "../controllers/ai_controller";

router.post("/debug", debugCode);

export default router;
