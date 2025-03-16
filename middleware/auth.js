import jwt from "jsonwebtoken";
import * as authRepository from "../data/user.js";
import { config } from "../config.js";

export const isAuth = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!(authHeader && authHeader.startsWith("Bearer "))) {
    return res.status(401).json({ message: "유효하지 않은 인증 정보입니다." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, config.jwt.user_secretKey, async (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    }
    
    const user = await authRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
    }
    
    req.userId = user._id;
    next();
  });
};
