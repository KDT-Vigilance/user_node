import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../data/user.js";
import { config } from "../config.js";
import { sendSMSCode, verifyStoredCode } from "../utils/sms.js";

const createJwtToken = (id) => {
    return jwt.sign({ id }, config.jwt.secretKey, { expiresIn: config.jwt.expiresInSec });
};

// 아이디 중복 확인
export const checkAccountAvailability = async (req, res) => {
    const { account } = req.body;
    if (!account) {
        return res.status(400).json({ message: "ID를 입력하세요." });
    }

    try {
        const existingUser = await User.findOne({ account });
        if (existingUser) {
            return res.status(409).json({ available: false, message: "이미 사용 중인 ID입니다." });
        }
        return res.status(200).json({ available: true, message: "사용 가능한 ID입니다." });
    } catch (error) {
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 휴대폰 인증번호 전송
export const sendVerificationCode = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: "전화번호를 입력하세요." });
    }

    try {
        const otpCode = await sendSMSCode(phone);
        if (!otpCode) {
            return res.status(500).json({ message: "인증번호 전송 실패" });
        }

        return res.status(200).json({ success: true, message: "인증번호가 전송되었습니다." });
    } catch (error) {
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 휴대폰 인증번호 검증
export const verifyCode = async (req, res) => {
    const { phone, code } = req.body;

    if (!phone || !code) {
        return res.status(400).json({ message: "전화번호와 인증번호를 입력하세요." });
    }

    try {
        const isValid = await verifyStoredCode(phone, code);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "인증번호가 틀렸습니다." });
        }

        return res.status(200).json({ success: true, message: "휴대폰 인증이 완료되었습니다." });
    } catch (error) {
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 회원가입
export const signupUser = async (req, res) => {
    try {
        const { name, account, password, phone, zip_code } = req.body;

        if (!name || !account || !password || !phone || !zip_code) {
            return res.status(400).json({ message: "모든 필드를 입력하세요." });
        }

        const existingAccount = await User.findOne({ account });
        if (existingAccount) {
            return res.status(409).json({ message: "이미 사용 중인 ID입니다." });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(409).json({ message: "이미 사용 중인 전화번호입니다." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            account,
            password: hashedPassword,
            phone,
            zip_code,
        });

        res.status(201).json({ message: "회원가입 성공!" });
    } catch (error) {
        res.status(500).json({ message: "회원가입 중 오류 발생", error: error.message });
    }
};

// 로그인
export const loginUser = async (req, res) => {
    try {
        console.log("로그인 요청 데이터:", req.body);
        console.log("현재 JWT Secret Key:", config.jwt.secretKey); // ✅ 값 확인용 로그

        const { account, password } = req.body;

        if (!account || !password) {
            return res.status(400).json({ message: "ID와 비밀번호를 입력하세요." });
        }

        const user = await User.findOne({ account });
        if (!user) {
            return res.status(401).json({ message: "존재하지 않는 ID입니다." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
        }

        // ✅ JWT 토큰 생성 (secretKey 값이 undefined인지 확인)
        const token = jwt.sign({ id: user._id }, config.jwt.secretKey, { expiresIn: config.jwt.expiresInSec });

        res.status(200).json({ token, userId: user._id.toString(), message: "로그인 성공!" });
    } catch (error) {
        console.error("🔥 로그인 중 서버 오류:", error);
        res.status(500).json({ message: "로그인 중 오류 발생", error: error.message });
    }
};


// 로그인 유지
export const me = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secretKey);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: "유효하지 않은 토큰입니다.", error: error.message });
    }
};

// 유저 찾기
export const userInfo = async (req, res) => {
    const { account } = req.body;
    if (!account) {
        return res.status(400).json({ message: "ID를 입력하세요." });
    }

    try {
        const existingUser = await User.findOne({ account });
        if (existingUser) {
            return res.status(409).json({ available: false, message: "이미 사용 중인 ID입니다." });
        }
        return res.status(200).json({ available: true, message: "사용 가능한 ID입니다." });
    } catch (error) {
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

