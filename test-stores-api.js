const axios = require('axios');

// 테스트용 설정
const API_BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'your-jwt-token-here'; // 실제 JWT 토큰으로 교체 필요

async function testStoresAPI() {
  try {
    console.log('🚀 Stores API 테스트 시작...\n');

    // 1. 가게 목록 조회
    console.log('📋 1. 가게 목록 조회 테스트');
    const listResponse = await axios.get(
      `${API_BASE_URL}/api/stores`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    console.log('✅ 가게 목록 조회 성공!');
    console.log('📊 응답:', JSON.stringify(listResponse.data, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    // 2. 가게 정보 저장
    console.log('💾 2. 가게 정보 저장 테스트');
    const createResponse = await axios.post(
      `${API_BASE_URL}/api/stores`,
      {
        name: "써브웨이 고양탄현점",
        location: "경기 고양시 일산서구",
        status: "영업중",
        hours: "08:00 - 22:00",
        category: "음식점",
        originalUrl: "https://naver.me/5xnfS2BM"
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    console.log('✅ 가게 정보 저장 성공!');
    console.log('📊 응답:', JSON.stringify(createResponse.data, null, 2));

  } catch (error) {
    console.error('❌ API 호출 실패:');
    if (error.response) {
      console.error('상태 코드:', error.response.status);
      console.error('에러 메시지:', error.response.data);
    } else {
      console.error('네트워크 에러:', error.message);
    }
  }
}

// 테스트 실행
testStoresAPI(); 