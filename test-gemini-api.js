const axios = require('axios');

// 테스트용 설정
const API_BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'your-jwt-token-here'; // 실제 JWT 토큰으로 교체 필요
const TEST_TEXT = `[네이버 지도]
써브웨이 고양탄현점
경기 고양시 일산서구 일현로 97-11 111호 상가동 1층
https://naver.me/5xnfS2BM`; // 실제 네이버 지도 공유 텍스트로 교체 필요

async function testGeminiAPI() {
  try {
    console.log('🚀 Gemini API 테스트 시작...\n');
    console.log('📝 입력 텍스트:');
    console.log(TEST_TEXT);
    console.log('\n' + '='.repeat(50) + '\n');

    const response = await axios.post(
      `${API_BASE_URL}/api/gemini/extract-store-info`,
      {
        text: TEST_TEXT
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('✅ API 호출 성공!');
    console.log('📊 응답 데이터:');
    console.log(JSON.stringify(response.data, null, 2));

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
testGeminiAPI(); 