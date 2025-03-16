import express from "express";
import * as authController from "../controller/auth.js";

const router = express.Router();

// 아이디 중복 확인
router.post("/check-account", authController.checkAccountAvailability);

// 휴대폰 인증번호 전송
router.post("/send-code", authController.sendVerificationCode);

// 휴대폰 인증번호 검증
router.post("/verify-code", authController.verifyCode);

// 회원가입
router.post("/signup", authController.signupUser);

// 로그인
router.post("/login", authController.loginUser);

// 로그인 유지 (토큰 인증)
router.get("/me", authController.me);

// // 로그아웃
// router.post("/logout", authController.logout);

export default router;
