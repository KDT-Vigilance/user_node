// const KAKAO_REST_API_KEY = "6025a901448983e735610ec11e54c784"; // 🔹 카카오 API 키
// const JUSO_API_KEY = "devU01TX0FVVEgyMDI1MDMyMDE2MjMzMDExNTU2NTM="; // 🔹 발급받은 API 키 입력

import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const JUSO_API_KEY = "devU01TX0FVVEgyMDI1MDMyMDE2MjMzMDExNTU2NTM="; // 🔹 도로명주소 API 키
const KAKAO_REST_API_KEY = "6025a901448983e735610ec11e54c784"; // 🔹 카카오 API 키

// 🔹 우편번호를 도로명 주소로 변환
const getRoadAddressFromZipcode = async (zipcode) => {
  const url = `https://www.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${JUSO_API_KEY}&currentPage=1&countPerPage=1&keyword=${zipcode}&resultType=json`;
  const response = await fetch(url);
  const data = await response.json();


  if (!data || !data.results.juso || data.results.juso.length === 0) {
    console.error("❌ 해당 우편번호에 대한 도로명 주소를 찾을 수 없습니다.");
    return null;
  }

  return data.results.juso[0].roadAddr; // 🔹 변환된 도로명 주소 반환
};

// 🔹 주소를 기반으로 좌표(위도, 경도) 찾기 (카카오 API 사용)
const getCoordinatesFromAddress = async (address) => {
  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
    address
  )}`;
  const response = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  });

  const data = await response.json();

  if (!data || !data.documents || data.documents.length === 0) {
    console.error("❌ 주소로 변환된 좌표를 찾을 수 없습니다.");
    return null;
  }

  return {
    lat: data.documents[0].y,
    lon: data.documents[0].x,
  };
};

// 🔹 좌표를 기반으로 가까운 지구대/파출소 찾기 (카카오 API 사용, 특정 카테고리 필터링)
const getNearestPoliceStation = async (lat, lon) => {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=경찰서&y=${lat}&x=${lon}&radius=5000&sort=distance`;
  const response = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  });

  const data = await response.json();

  if (!data || !data.documents || data.documents.length === 0) {
    console.error("❌ 가까운 경찰서를 찾을 수 없습니다.");
    return null;
  }

  // 🔹 "사회,공공기관 > 행정기관 > 경찰서 > 지구대", "사회,공공기관 > 행정기관 > 경찰서 > 파출소" 카테고리만 필터링
  const policeStations = data.documents.filter(
    (station) =>
      station.category_name.includes(
        "사회,공공기관 > 행정기관 > 경찰서 > 지구대"
      ) ||
      station.category_name.includes(
        "사회,공공기관 > 행정기관 > 경찰서 > 파출소"
      )
  );

  if (policeStations.length === 0) {
    console.error("❌ 필터링된 지구대/파출소가 없습니다.");
    return null;
  }

  return {
    name: policeStations[0].place_name,
    address: policeStations[0].address_name,
    phone: policeStations[0].phone
      ? policeStations[0].phone.replace(/[^0-9]/g, "")
      : "전화번호 없음",
  };
};

// 🔹 우편번호로 지구대/파출소 찾기
export const findNearestPoliceStation = async (zipcode) => {
  try {
    // 1️⃣ 우편번호를 도로명 주소로 변환
    const address = await getRoadAddressFromZipcode(zipcode);
    if (!address) {
      console.log("❌ 우편번호를 변환할 주소가 없습니다.");
      return;
    }

    // 2️⃣ 주소를 좌표로 변환
    const coords = await getCoordinatesFromAddress(address);
    if (!coords) {
      console.log("❌ 변환된 주소로 좌표를 찾을 수 없습니다.");
      return;
    }

    console.log(`📌 좌표: 위도(${coords.lat}), 경도(${coords.lon})`);

    // 3️⃣ 좌표를 기반으로 지구대/파출소 검색
    const policeStation = await getNearestPoliceStation(coords.lat, coords.lon);
    if (!policeStation) {
      console.log("❌ 가까운 지구대/파출소를 찾을 수 없습니다.");
      return;
    }
    return policeStation.phone;
  } catch (error) {
    console.error("🚨 오류 발생:", error);
  }
};
