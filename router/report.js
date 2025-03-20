import express from "express";
import * as reportController from "../controller/report.js";

const router = express.Router();

// 🚨 신고 생성
router.post("/", reportController.createReport);

// 🚨 신고 상태 조회
router.get("/status/:reportId", reportController.getReportStatus);

export default router;
