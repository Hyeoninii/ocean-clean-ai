import React, { useState, useEffect } from 'react';
import { WasteData, WasteDataFilter, WasteDataStatistics } from '../types/WasteData';
import { wasteDataApi } from '../services/api';

const DataPage: React.FC = () => {
  const [wasteData, setWasteData] = useState<WasteData[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<WasteDataStatistics | null>(null);
  const [filter, setFilter] = useState<WasteDataFilter>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchData();
    fetchLabels();
    fetchStatistics();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await wasteDataApi.getFilteredWasteData(filter);
      setWasteData(data);
      setCurrentPage(0);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabels = async () => {
    try {
      const data = await wasteDataApi.getDistinctLabels();
      setLabels(data);
    } catch (error) {
      console.error('라벨 로드 실패:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await wasteDataApi.getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const handleFilterChange = (key: keyof WasteDataFilter, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: value === '전체' ? undefined : value
    }));
  };

  const getRiskLevelColor = (riskScore: number) => {
    if (riskScore >= 4.0) return '#dc3545'; // 빨강
    if (riskScore >= 3.5) return '#fd7e14'; // 주황
    if (riskScore >= 3.0) return '#ffc107'; // 노랑
    return '#28a745'; // 초록
  };

  const getKoreanLabel = (label: string) => {
    const labelMap: { [key: string]: string } = {
      "Fish_net": "어망",
      "Fish_trap": "어구",
      "Glass": "유리",
      "Metal": "금속",
      "Plastic": "플라스틱",
      "Rope": "로프",
      "Rubber_etc": "고무류",
      "Rubber_tire": "고무타이어",
      "Wood": "목재",
      "PET_Bottle": "PET 병",
      "Bottle": "병",
      "Can": "캔",
      "Bag": "비닐봉지",
      "Container": "컨테이너"
    };
    return labelMap[label] || label;
  };

  const totalPages = Math.ceil(wasteData.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = wasteData.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-title">🌊 해양 쓰레기 탐지 데이터</div>
      
      {/* 필터 섹션 */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>필터 옵션</h3>
        <div className="grid grid-2">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              쓰레기 종류
            </label>
            <select 
              className="select"
              value={filter.label || '전체'}
              onChange={(e) => handleFilterChange('label', e.target.value)}
            >
              <option value="전체">전체</option>
              {labels.map(label => (
                <option key={label} value={label}>
                  {getKoreanLabel(label)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              위험도 필터
            </label>
            <select 
              className="select"
              value={filter.riskLevel || '전체'}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            >
              <option value="전체">전체</option>
              <option value="high">높음 (3.5+)</option>
              <option value="medium">보통 (3.0-3.5)</option>
              <option value="low">낮음 (3.0 미만)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 통계 정보 */}
      {statistics && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>통계 정보</h3>
          <div className="grid grid-4">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                {wasteData.length.toLocaleString()}
              </div>
              <div>총 탐지 건수</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                {statistics.averageRiskScore?.toFixed(2) || '0.00'}
              </div>
              <div>평균 위험도</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                {statistics.labelCounts?.[0]?.[0] ? getKoreanLabel(statistics.labelCounts[0][0]) : '없음'}
              </div>
              <div>가장 많은 쓰레기</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                {statistics.maxRiskScore?.toFixed(2) || '0.00'}
              </div>
              <div>최고 위험도</div>
            </div>
          </div>
        </div>
      )}

      {/* 데이터 카드들 */}
      <div className="grid grid-3">
        {currentData.map((item) => (
          <div key={item.id} className="card">
            <div style={{ marginBottom: '1rem' }}>
              <img 
                src={`http://localhost:8080/${item.imagePath}`}
                alt={item.labelKorean}
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover',
                  borderRadius: '5px',
                  backgroundColor: '#f5f5f5'
                }}
                onError={(e) => {
                  console.log('이미지 로딩 실패:', item.imagePath);
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=이미지+없음';
                }}
                onLoad={() => {
                  console.log('이미지 로딩 성공:', item.imagePath);
                }}
              />
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>주요 쓰레기:</strong> {item.labelKorean}
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>위험도:</strong> 
              <span style={{ 
                color: getRiskLevelColor(item.riskScore),
                fontWeight: 'bold',
                marginLeft: '0.5rem'
              }}>
                {item.riskScore.toFixed(1)} ({item.riskLevel})
              </span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>위치:</strong> {item.locationName}
            </div>
            
            <button 
              className="button"
              style={{ width: '100%', fontSize: '0.9rem' }}
            >
              🧹 치워야 할 쓰레기 추천
            </button>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
            <button 
              className="button"
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
            >
              처음
            </button>
            <button 
              className="button"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              이전
            </button>
            <span style={{ padding: '0 1rem' }}>
              {currentPage + 1} / {totalPages}
            </span>
            <button 
              className="button"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
            >
              다음
            </button>
            <button 
              className="button"
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
            >
              마지막
            </button>
          </div>
        </div>
      )}

      {wasteData.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.2rem', color: '#666' }}>
            조건에 맞는 데이터가 없습니다.
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPage;
