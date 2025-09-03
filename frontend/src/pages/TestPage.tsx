import React, { useState, useEffect } from 'react';
import { wasteDataApi } from '../services/api';

const TestPage: React.FC = () => {
  const [dataCount, setDataCount] = useState<number>(0);
  const [sampleData, setSampleData] = useState<any[]>([]);
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
