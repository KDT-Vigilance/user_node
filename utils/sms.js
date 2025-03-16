import coolsms from "coolsms-node-sdk";
import { config } from "../config.js";

const otpStorage = new Map();

/**
 * ✅ SMS 인증번호 전송 (함수명 변경)
 */
export async function sendSMSCode(phone) {
    const smsService = new coolsms.default(config.api.apiKey, config.api.apiSecretKey);

    if (!phone) {
        console.error("전화번호를 입력하세요.");
        return null;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const message = `[Vigilance] 인증번호: ${otpCode} 입력하여 인증을 완료하세요.`;

    try {
        const result = await smsService.sendOne({
            to: phone,
            from: config.api.hpNumber,
            text: message
        });

        console.log("인증번호 전송 성공:", result);

        otpStorage.set(phone, otpCode);
        setTimeout(() => otpStorage.delete(phone), 300000);

        return otpCode;
    } catch (err) {
        console.error("인증번호 전송 실패:", err);
        return null;
    }
}

/**
 * ✅ 인증번호 검증
 */
export async function verifyStoredCode(phone, code) {
    if (!otpStorage.has(phone)) {
        return false;
    }

    const storedCode = otpStorage.get(phone);
    if (storedCode === code) {
        otpStorage.delete(phone);
        return true;
    }

    return false;
}
