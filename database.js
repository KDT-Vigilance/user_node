import mongoose from "mongoose";
import { config } from "./config.js";

export default function connectDB() {
  return mongoose.connect(config.db.host)
    .then(() => console.log("MongoDB 연결 성공!"))
    .catch((err) => {
      console.error("MongoDB 연결 실패:", err);
      process.exit(1); // 연결 실패 시 프로세스 종료
    });
}
