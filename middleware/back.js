import fetch from "node-fetch";
import { config } from "../config.js"; // 환경 변수 적용

/** 🔹 카카오 API를 이용한 경찰서 또는 파출소 전화번호 조회 함수 */
export const getPoliceStationContact = async (zipCode) => {
  try {
    console.log("🔍 사용자 zip_code 확인:", zipCode);

    // ✅ Step 1: 우편번호 → 주소 변환 (카카오 주소 API 사용)
    console.log("📍 우편번호를 주소로 변환 중:", zipCode);

    const addressResponse = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(zipCode)}`,
      {
        method: "GET",
        headers: {
          Authorization: `KakaoAK ${config.kakao.apiKey}`, // ✅ 수정됨
        },
      }
    );

    const addressData = await addressResponse.json();
    console.log("📩 주소 변환 응답:", JSON.stringify(addressData, null, 2));

    if (!addressData.documents || addressData.documents.length === 0) {
      console.error("❌ 우편번호에 해당하는 주소가 없습니다.");
      return null;
    }

    const address = addressData.documents[0].address_name;
    console.log("✅ 변환된 주소:", address);

    // ✅ Step 2: 변환된 주소를 사용하여 경찰서 검색
    console.log("🔍 카카오 API로 경찰서 검색 시작 (주소 기반):", address);

    const policeResponse = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(`경찰서 ${address}`)}&size=5`,
      {
        method: "GET",
        headers: {
          Authorization: `KakaoAK ${config.kakao.apiKey}`, // ✅ 수정됨
        },
      }
    );

    const policeData = await policeResponse.json();
    console.log("📩 카카오 API 응답 데이터:", JSON.stringify(policeData, null, 2));

    if (!policeData.documents || policeData.documents.length === 0) {
      console.error("❌ 검색된 경찰서 또는 파출소가 없습니다.");
      return null;
    }

    // 🔥 "경찰서" 또는 "파출소"를 포함하는 가장 가까운 1개 선택
    const policeStation = policeData.documents.find(item =>
      item.place_name.includes("경찰서") || item.place_name.includes("파출소")
    );

    if (!policeStation) {
      console.error("❌ 경찰서 또는 파출소가 검색되지 않았습니다.");
      return null;
    }

    // 전화번호 숫자만 추출
    let policeContact = policeStation.phone.replace(/[^0-9]/g, "");

    console.log("✅ 가장 가까운 경찰서/파출소 전화번호:", policeContact);

    return policeContact; // 숫자만 반환
  } catch (error) {
    console.error("❌ 카카오 API 호출 실패:", error);
    return null;
  }
};
