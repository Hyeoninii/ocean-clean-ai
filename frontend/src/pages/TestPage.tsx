import React, { useState, useEffect } from 'react';
import { wasteDataApi } from '../services/api';

const TestPage: React.FC = () => {
  const [dataCount, setDataCount] = useState<number>(0);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [yoloStatus, setYoloStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      
      // 데이터 개수 확인
      const countResponse = await fetch('http://localhost:8080/api/test/data-count');
      const countData = await countResponse.json();
      setDataCount(countData.totalCount);
      
      // 샘플 데이터 확인
      const sampleResponse = await fetch('http://localhost:8080/api/test/sample-data');
      const sampleData = await sampleResponse.json();
      setSampleData(sampleData);
      
      // YOLO 서비스 상태 확인
      try {
        const yoloStatusData = await wasteDataApi.getYOLOStatus();
        setYoloStatus(yoloStatusData);
      } catch (yoloError) {
        console.error('YOLO 상태 확인 실패:', yoloError);
        setYoloStatus({ error: 'YOLO 상태 확인 실패' });
      }
      
    } catch (error) {
      console.error('테스트 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">테스트 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-title">🧪 데이터 테스트 페이지</div>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>데이터베이스 상태</h3>
        <p><strong>총 데이터 개수:</strong> {dataCount}개</p>
        <button className="button" onClick={fetchTestData}>
          새로고침
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>🤖 YOLO AI 서비스 상태</h3>
        {yoloStatus ? (
          <div>
            <p><strong>모델 파일:</strong> 
              <span style={{ color: yoloStatus.modelAvailable ? '#28a745' : '#dc3545' }}>
                {yoloStatus.modelAvailable ? '✅ 사용 가능' : '❌ 없음'}
              </span>
            </p>
            <p><strong>Python 스크립트:</strong> 
              <span style={{ color: yoloStatus.scriptAvailable ? '#28a745' : '#dc3545' }}>
                {yoloStatus.scriptAvailable ? '✅ 사용 가능' : '❌ 없음'}
              </span>
            </p>
            <p><strong>Python 환경:</strong> 
              <span style={{ color: yoloStatus.pythonAvailable ? '#28a745' : '#dc3545' }}>
                {yoloStatus.pythonAvailable ? '✅ 설치됨' : '❌ 설치 안됨'}
              </span>
            </p>
            <p><strong>모델 경로:</strong> {yoloStatus.modelPath}</p>
            <p><strong>스크립트 경로:</strong> {yoloStatus.scriptPath}</p>
            {yoloStatus.error && (
              <p style={{ color: '#dc3545' }}><strong>오류:</strong> {yoloStatus.error}</p>
            )}
          </div>
        ) : (
          <p>YOLO 상태를 확인하는 중...</p>
        )}
      </div>

      <div className="card">
        <h3>샘플 데이터 (최대 5개)</h3>
        {sampleData.length > 0 ? (
          <div>
            {sampleData.map((item, index) => (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                marginBottom: '1rem',
                borderRadius: '5px'
              }}>
                <p><strong>파일명:</strong> {item.fileName}</p>
                <p><strong>라벨:</strong> {item.label}</p>
                <p><strong>위도:</strong> {item.latitude}</p>
                <p><strong>경도:</strong> {item.longitude}</p>
                <p><strong>위험도:</strong> {item.riskScore}</p>
                <p><strong>이미지 경로:</strong> {item.imagePath}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default TestPage;
