import express from "express";
import * as apiController from "../controller/api.js";

const router = express.Router();

// 로그인
router.post("/camera-info", apiController.cameraInfo);

export default router;
