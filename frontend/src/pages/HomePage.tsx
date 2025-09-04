import React, { useState, useEffect } from 'react';
import { HomeData } from '../types/WasteData';
import { homeApi } from '../services/api';
import oceanImage from '../assets/image.png';

const HomePage: React.FC = () => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await homeApi.getHomeData();
        setHomeData(data);
      } catch (error) {
        console.error('홈 데이터 로드 실패:', error);
        // 기본 데이터 설정
        setHomeData({
          title: "🌏 Ocean Clean AI",
          features: [
            "🚢 선박 항로 및 어업 지역 보호",
            "🐟 해양 생태계 데이터 기반 보호",
            "📷 AI 이미지 분석 + 위험도 지도 시각화"
          ],
          imagePath: "/assets/image.png"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
     
      
      <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
          <div className="page-title" style={{ fontSize: '2.4rem', fontWeight: 'bold'}}>{homeData?.title}
          
          <div style={{marginTop: '5rem', marginBottom: '2rem' }}>
            {homeData?.features.map((feature, index) => (
              <div key={index} style={{ 
                marginBottom: '1rem', 
                fontSize: '1.1rem',
                padding: '0.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px',
                borderLeft: '4px solid #667eea',
                color: '#222' // 글자색 검정
              }}>
                {feature}
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button 
              className="button"
              onClick={() => window.location.href = '/upload'}
              style={{ 
                fontSize: '1.1rem', 
                padding: '1rem 2rem'
              }}
            >
              이미지 업로드
            </button>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <img 
            src={oceanImage} 
            alt="Ocean Clean AI" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </div>
      </div>
      
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>주요 기능</h3>
        <div className="grid grid-3">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <h4>데이터 현황</h4>
            <p>해양 쓰레기 탐지 데이터 필터링</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗺️</div>
            <h4>위험도 지도</h4>
            <p>지도에서 위험도 등급에 따른 쓰레기 위치를 시각화</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
            <h4>AI 분석</h4>
            <p>YOLO 모델을 사용한 업로드된 이미지를 분석</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
