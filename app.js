import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import { config } from "./config.js";
import connectDB from "./database.js";
import authRouter from "./router/auth.js";

dotenv.config();

const app = express();

// 미들웨어 설정
app.use(express.json());

// public 폴더를 정적 파일 제공 경로로 설정
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: "*",
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type", "userid"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// 라우터
app.use("/auth",authRouter);

// 백엔드 포트가져오기 
const port = config.hosting_port.user_back || 8080;

// MongoDB 연결 -> DB연결 안되면 서버 실행 안됨
connectDB()
  .then(() => {
    app.listen(port, () =>
      console.log(` 서버 실행 중: http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error(" 서버 시작 실패:", err);
    process.exit(1); // 서버 종료
  });