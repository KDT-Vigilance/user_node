import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import { config } from "./config.js";
import connectDB from "./database.js";
import apiRouter from "./router/api.js";
import authRouter from "./router/auth.js";
import reportRouter from "./router/report.js"; // 🚨 신고 라우터 추가

dotenv.config();

const app = express();
app.use(express.json());

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

// 🔹 라우터 설정
app.use("/auth", authRouter);
app.use("/api", apiRouter);
app.use("/report", reportRouter); // 🚨 신고 라우터 추가

const port = config.hosting_port.user_back || 8080;
connectDB()
  .then(() => {
    app.listen(port, () => console.log(` 서버 실행 중: http://localhost:${port}`));
  })
  .catch((err) => {
    console.error(" 서버 시작 실패:", err);
    process.exit(1);
  });
 