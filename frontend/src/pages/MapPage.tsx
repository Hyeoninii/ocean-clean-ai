import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { WasteData } from '../types/WasteData';
import { wasteDataApi } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet 아이콘 설정
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapPage: React.FC = () => {
  const [wasteData, setWasteData] = useState<WasteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState<WasteData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await wasteDataApi.getAllWasteData();
      setWasteData(data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 4.0) return '#dc3545'; // 빨강
    if (riskScore >= 3.5) return '#fd7e14'; // 주황
    if (riskScore >= 3.0) return '#ffc107'; // 노랑
    return '#28a745'; // 초록
  };

  const getRiskLevelText = (riskScore: number) => {
    if (riskScore >= 4.0) return '매우 높음';
    if (riskScore >= 3.5) return '높음';
    if (riskScore >= 3.0) return '보통';
    return '낮음';
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

  // 지도 중심점 계산 (데이터의 평균 위치)
  const getMapCenter = () => {
    if (wasteData.length === 0) return [35.0, 129.0]; // 기본값 (부산)
    
    const avgLat = wasteData.reduce((sum, item) => sum + item.latitude, 0) / wasteData.length;
    const avgLon = wasteData.reduce((sum, item) => sum + item.longitude, 0) / wasteData.length;
    
    return [avgLat, avgLon];
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">지도 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-title">해양 쓰레기 위험도 지도</div>
      
      {/* 범례 */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>위험도 등급</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#dc3545', 
              borderRadius: '50%' 
            }}></div>
            <span>매우 높음 (4.0+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#fd7e14', 
              borderRadius: '50%' 
            }}></div>
            <span>높음 (3.5-4.0)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#ffc107', 
              borderRadius: '50%' 
            }}></div>
            <span>보통 (3.0-3.5)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#28a745', 
              borderRadius: '50%' 
            }}></div>
            <span>낮음 (3.0 미만)</span>
          </div>
        </div>
      </div>

      {/* 지도 */}
      <div style={{ height: '600px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <MapContainer
          center={getMapCenter() as [number, number]}
          zoom={9}
          minZoom={8}
          maxZoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {wasteData.map((item) => (
            <CircleMarker
              key={item.id}
              center={[item.latitude, item.longitude]}
              radius={10}
              color={getRiskColor(item.riskScore)}
              fillColor={getRiskColor(item.riskScore)}
              fillOpacity={0.8}
              weight={3}
            >
              <Popup>
                <div style={{ minWidth: '250px' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>
                    {getKoreanLabel(item.label)}
                  </h4>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>위도:</strong> {item.latitude.toFixed(6)}
                  </p>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>경도:</strong> {item.longitude.toFixed(6)}
                  </p>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>위험도:</strong> {item.riskScore.toFixed(2)} ({getRiskLevelText(item.riskScore)})
                  </p>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>위치:</strong> {item.locationName}
                  </p>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>발견일:</strong> {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <img 
                      src={`http://localhost:8080/${item.imagePath}`}
                      alt={item.labelKorean}
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '150px',
                        objectFit: 'cover',
                        borderRadius: '5px'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=이미지+없음';
                      }}
                    />
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>



      {/* 통계 정보 */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>지도 통계</h3>
        <div className="grid grid-4">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
              {wasteData.length}
            </div>
            <div>총 마커 수</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
              {wasteData.filter(item => item.riskScore >= 4.0).length}
            </div>
            <div>고위험도</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fd7e14' }}>
              {wasteData.filter(item => item.riskScore >= 3.5 && item.riskScore < 4.0).length}
            </div>
            <div>중간 위험도</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
              {wasteData.filter(item => item.riskScore < 3.0).length}
            </div>
            <div>낮은 위험도</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
