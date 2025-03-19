import User from "../data/user.js";
import fetch from "node-fetch"; // `fetch` 사용
import mongoose from "mongoose"; // ✅ ObjectId 변환을 위해 mongoose 추가

export const cameraInfo = async (req, res) => {
    const { userId, camName } = req.body;

    // ✅ 요청 데이터 확인
    console.log("📌 요청 데이터:", req.body);

    if (!userId || !camName) {
        console.error("❌ userId 또는 camName이 없습니다.");
        return res.status(400).json({ message: "userId와 camName이 필요합니다." });
    }

    try {
        // ✅ `userId`를 ObjectId로 변환 (24자 hex 문자열인지 확인 후 변환)
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error("❌ 잘못된 ObjectId 형식:", userId);
            return res.status(400).json({ message: "잘못된 userId 형식입니다." });
        }

        // ✅ MongoDB에서 userId로 사용자 정보 조회
        console.log("🔍 MongoDB에서 사용자 조회 중:", userId);
        const user = await User.findById(userId);

        if (!user) {
            console.error("❌ 사용자를 찾을 수 없습니다:", userId);
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }

        // ✅ 조회된 사용자 정보 출력 (phone, zip_code가 없을 수도 있음)
        const phone = user.phone ? String(user.phone) : "";
        const zip_code = user.zip_code ? String(user.zip_code) : "";
        console.log("✅ 조회된 사용자 정보:", phone, zip_code);

        // ✅ FastAPI로 전송할 데이터 준비
        const fastApiUrl = "http://localhost:8000/video/store_camera_info";
        const requestBody = { 
            phone, 
            zip_code, 
            cam_name: String(camName) // ✅ cam_name을 문자열로 변환
        };

        console.log("📌 FastAPI에 전송할 데이터:", requestBody);  // ✅ FastAPI로 보내는 데이터 확인

        // ✅ FastAPI로 데이터 전송
        const response = await fetch(fastApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("❌ FastAPI 요청 실패:", response.status, response.statusText, errorMessage);
            throw new Error(`FastAPI 요청 실패: ${response.statusText}`);
        }

        console.log("✅ FastAPI로 데이터 전송 완료");
        return res.status(200).json({ message: "FastAPI로 정보 전송 완료" });

    } catch (error) {
        console.error("❌ FastAPI로 데이터 전송 중 오류:", error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};
