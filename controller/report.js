import Report from "../data/report.js";
import User from "../data/user.js";
import { findNearestPoliceStation } from "../middleware/openapi.js";

/** 🚨 신고 생성 API */
export const createReport = async (req, res) => {
  const { userId, camName, videoUrl } = req.body;

  if (!userId || !camName || !videoUrl) {
    console.error("❌ 요청 데이터 누락:", { userId, camName, videoUrl });
    return res.status(400).json({ message: "userId, camName, videoUrl가 필요합니다." });
  }

  try {
    console.log("🔍 신고 생성 요청 수신:", { userId, camName, videoUrl });

    // ✅ 중복 video_url 체크
    const existingReport = await Report.findOne({ video_url: videoUrl });
    if (existingReport) {
      console.warn("⚠️ 이미 저장된 video_url입니다. 중복 저장 방지됨:", videoUrl);
      return res.status(409).json({ message: "이미 등록된 video_url입니다." });
    }

    // 🔍 유저 zip_code 조회
    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ 사용자를 찾을 수 없음:", userId);
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    if (!user.zip_code) {
      console.error("❌ 사용자 zip_code 없음:", userId);
      return res.status(400).json({ message: "사용자의 zip_code가 존재하지 않습니다." });
    }

    console.log("✅ 사용자 zip_code 확인:", user.zip_code);

    // 📌 OpenAPI를 통해 경찰서 연락처 가져오기
    const policeTel = await findNearestPoliceStation(user.zip_code);
    if (!policeTel) {
      console.error("❌ 경찰서 연락처 조회 실패:", user.zip_code);
      return res.status(500).json({ message: "경찰서 연락처 조회 실패" });
    }

    console.log("✅ 경찰서 연락처 확인:", policeTel);

    // 🚨 신고 객체 생성
    const report = await Report.create({
      user_id: userId,
      video_url: videoUrl,
      cam_name: camName,
      status: 0, // 초기 상태: "송신 완료"
      tel: policeTel,
    });

    console.log("report 객체 생성 완료 값 ☆☆☆☆☆☆☆☆☆☆☆", report);

    // fetch 9090/report/send_report
    await fetch("http://localhost:9090/report/send_report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reportId: report._id }),
    })
      .then((response) => response.json())
      .then((data) => console.log("✅ 신고 전송 완료:", data))
      .catch((error) => console.error("❌ 신고 전송 실패:", error));

    res.status(201).json(report);
  } catch (error) {
    console.error("❌ 신고 저장 중 오류:", error);
    res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};

/** 🚨 신고 상태 조회 API */
export const getReportStatus = async (req, res) => {
  const { reportId } = req.params;

  if (!reportId) {
    console.error("❌ 요청에 reportId 없음");
    return res.status(400).json({ message: "reportId가 필요합니다." });
  }

  try {
    console.log("🔍 신고 상태 조회 요청:", reportId);

    const report = await Report.findById(reportId);
    if (!report) {
      console.error("❌ 신고 내역 없음:", reportId);
      return res.status(404).json({ message: "신고 내역을 찾을 수 없습니다." });
    }

    // 🔹 상태 코드 변환
    const statusMessages = {
      0: "송신 완료",
      1: "확인 중",
      2: "출동 중",
      3: "조치 완료",
      4: "이상 무",
    };

    console.log("✅ 신고 상태 확인:", {
      reportId,
      status: report.status,
      message: statusMessages[report.status],
    });

    res.status(200).json({ status: report.status, message: statusMessages[report.status] });
  } catch (error) {
    console.error("❌ 신고 상태 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};
