import React, { useState, useRef } from 'react';
import { UploadResponse } from '../types/WasteData';
import { wasteDataApi } from '../services/api';

const UploadPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await wasteDataApi.uploadImage(uploadedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.success) {
        setAnalysisResult(result);
      } else {
        setError(result.error || '분석 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError('업로드 중 오류가 발생했습니다.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setPreviewUrl('');
    setAnalysisResult(null);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      "Wood": "목재"
    };
    return labelMap[label] || label;
  };

  const getRiskLevelColor = (riskScore: number) => {
    if (riskScore >= 4.0) return '#dc3545';
    if (riskScore >= 3.5) return '#fd7e14';
    if (riskScore >= 3.0) return '#ffc107';
    return '#28a745';
  };

  const getRiskLevelText = (riskScore: number) => {
    if (riskScore >= 4.0) return '🔴 매우 높음';
    if (riskScore >= 3.5) return '🟠 높음';
    if (riskScore >= 3.0) return '🟡 보통';
    return '🟢 낮음';
  };

  return (
    <div className="page-container">
      <div className="page-title">📷 해양 쓰레기 이미지 분석</div>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
          해양 쓰레기 사진을 업로드하면 AI가 자동으로 분석하여 위험도를 평가합니다.
        </p>
      </div>

      {/* 파일 업로드 섹션 */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>이미지 업로드</h3>
        
        <div style={{ 
          border: '2px dashed #ddd', 
          borderRadius: '10px', 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: '#fafafa'
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {!uploadedFile ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                이미지 파일을 선택하거나 여기에 드래그하세요
              </p>
              <button 
                className="button"
                onClick={() => fileInputRef.current?.click()}
              >
                파일 선택
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '300px', 
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '5px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} 
                />
              </div>
              <p style={{ marginBottom: '1rem' }}>
                <strong>선택된 파일:</strong> {uploadedFile.name}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  className="button"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? '분석 중...' : '분석 시작'}
                </button>
                <button 
                  className="button"
                  onClick={handleReset}
                  disabled={uploading}
                  style={{ backgroundColor: '#6c757d' }}
                >
                  다시 선택
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 진행률 표시 */}
      {uploading && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>분석 진행 상황</h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              width: '100%', 
              height: '20px', 
              backgroundColor: '#e9ecef', 
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${uploadProgress}%`, 
                height: '100%', 
                backgroundColor: '#667eea',
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {uploadProgress}%
              </div>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: '#666' }}>
            AI가 이미지를 분석하고 있습니다...
          </p>
        </div>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div className="error">
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* 분석 결과 */}
      {analysisResult && analysisResult.success && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>📍 분석 결과</h3>
          
          <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
            <div>
              <h4 style={{ marginBottom: '1rem' }}>감지된 객체</h4>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '5px',
                border: '1px solid #dee2e6'
              }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>종류:</strong> {getKoreanLabel(analysisResult.detectedLabel || '')}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>위험도:</strong> 
                  <span style={{ 
                    color: getRiskLevelColor(analysisResult.riskScore || 0),
                    fontWeight: 'bold',
                    marginLeft: '0.5rem'
                  }}>
                    {analysisResult.riskScore?.toFixed(2)} ({getRiskLevelText(analysisResult.riskScore || 0)})
                  </span>
                </p>
                <p>
                  <strong>위치:</strong> {analysisResult.data?.locationName}
                </p>
              </div>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '1rem' }}>분석된 이미지</h4>
              <img 
                src={previewUrl} 
                alt="Analyzed" 
                style={{ 
                  width: '100%', 
                  maxHeight: '200px',
                  objectFit: 'cover',
                  borderRadius: '5px'
                }} 
              />
            </div>
          </div>

          <div style={{ 
            textAlign: 'center', 
            padding: '1.5rem',
            backgroundColor: '#e8f5e8',
            borderRadius: '5px',
            border: '1px solid #c3e6c3'
          }}>
            <p style={{ fontSize: '1.1rem', color: '#2d5a2d', margin: 0 }}>
              ✅ 해당 이미지와 분석 결과를 신고 접수하였습니다. 감사합니다! 😉
            </p>
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      {!uploadedFile && !uploading && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📷</div>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>
            사진을 업로드하면 AI 분석이 시작됩니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
