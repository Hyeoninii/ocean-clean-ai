import React, { useRef, useEffect, useState } from 'react';

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Detection {
  class: string;
  confidence: number;
  class_id: number;
  bbox?: BoundingBox;
}

interface BoundingBoxImageProps {
  imageUrl: string;
  detections: Detection[];
  getKoreanLabel: (label: string) => string;
  getRiskLevelColor: (riskScore: number) => string;
}

const BoundingBoxImage: React.FC<BoundingBoxImageProps> = ({
  imageUrl,
  detections,
  getKoreanLabel,
  getRiskLevelColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // 위험도 점수 계산 (임시)
  const calculateRiskScore = (label: string, confidence: number) => {
    const baseRiskScores: { [key: string]: number } = {
      'Fish_net': 4.5,
      'Fish_trap': 3.0,
      'Glass': 3.8,
      'Metal': 3.5,
      'Plastic': 4.0,
      'Rope': 3.2,
      'Rubber_etc': 3.3,
      'Rubber_tire': 3.4,
      'Wood': 2.8,
      'PET_Bottle': 3.1,
      'Bottle': 3.1,
      'Can': 3.2,
      'Bag': 3.8,
      'Container': 3.0
    };
    
    const baseScore = baseRiskScores[label] || 3.0;
    const confidenceFactor = 0.5 + (confidence * 0.5);
    return baseScore * confidenceFactor;
  };

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 이미지의 실제 표시 크기 계산
    const imageRect = image.getBoundingClientRect();
    const scaleX = imageRect.width / imageDimensions.width;
    const scaleY = imageRect.height / imageDimensions.height;

    // 캔버스 크기를 이미지 표시 크기에 맞춤
    canvas.width = imageRect.width;
    canvas.height = imageRect.height;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 바운딩박스 그리기
    detections.forEach((detection, index) => {
      if (!detection.bbox) return;

      // 원본 좌표를 표시 크기에 맞게 스케일링
      const { x1, y1, x2, y2 } = detection.bbox;
      const scaledX1 = x1 * scaleX;
      const scaledY1 = y1 * scaleY;
      const scaledX2 = x2 * scaleX;
      const scaledY2 = y2 * scaleY;
      const scaledWidth = scaledX2 - scaledX1;
      const scaledHeight = scaledY2 - scaledY1;

      const riskScore = calculateRiskScore(detection.class, detection.confidence);
      const color = getRiskLevelColor(riskScore);

      // 바운딩박스 그리기
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX1, scaledY1, scaledWidth, scaledHeight);

      // 라벨 배경 그리기
      const label = getKoreanLabel(detection.class);
      const confidenceText = `${(detection.confidence * 100).toFixed(1)}%`;
      const labelText = `${label} (${confidenceText})`;
      
      ctx.font = 'bold 12px Arial';
      const textMetrics = ctx.measureText(labelText);
      const textWidth = textMetrics.width;
      const textHeight = 16;

      // 라벨 배경
      ctx.fillStyle = color;
      ctx.fillRect(scaledX1, scaledY1 - textHeight, textWidth + 8, textHeight);

      // 라벨 텍스트
      ctx.fillStyle = 'white';
      ctx.fillText(labelText, scaledX1 + 4, scaledY1 - 2);
    });
  };

  useEffect(() => {
    if (imageLoaded) {
      // 이미지 로드 후 약간의 지연을 두고 바운딩박스 그리기
      const timer = setTimeout(() => {
        drawBoundingBoxes();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, detections, imageDimensions]);

  // 윈도우 리사이즈 시 바운딩박스 다시 그리기
  useEffect(() => {
    const handleResize = () => {
      if (imageLoaded) {
        drawBoundingBoxes();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded, detections, imageDimensions]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
      setImageLoaded(true);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Analysis Result"
        style={{
          maxWidth: '100%',
          maxHeight: '400px',
          objectFit: 'contain',
          borderRadius: '5px',
          display: 'block'
        }}
        onLoad={handleImageLoad}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          maxWidth: '100%',
          maxHeight: '400px',
          objectFit: 'contain'
        }}
      />
      
      {/* 범례 */}
      {detections.length > 0 && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          <strong>감지된 객체:</strong>
          {detections.map((detection, index) => {
            const riskScore = calculateRiskScore(detection.class, detection.confidence);
            const color = getRiskLevelColor(riskScore);
            return (
              <div key={index} style={{ marginTop: '5px' }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: color, 
                  marginRight: '5px',
                  borderRadius: '2px'
                }}></span>
                {getKoreanLabel(detection.class)} - {(detection.confidence * 100).toFixed(1)}%
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BoundingBoxImage;
