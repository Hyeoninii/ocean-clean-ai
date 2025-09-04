#!/usr/bin/env python3
"""
YOLO 모델을 사용한 해양 쓰레기 이미지 분석 스크립트
"""

import sys
import json
import torch
from ultralytics import YOLO
import os
from pathlib import Path
import warnings
import logging

# YOLO 로그 출력 억제
warnings.filterwarnings('ignore')
logging.getLogger('ultralytics').setLevel(logging.ERROR)

def analyze_image_with_yolo(image_path, model_path, existing_risk_scores=None):
    """
    YOLO 모델을 사용하여 이미지를 분석하고 결과를 반환
    
    Args:
        image_path (str): 분석할 이미지 파일 경로
        model_path (str): YOLO 모델 파일 경로 (.pt)
        existing_risk_scores (list): 기존 데이터베이스의 위험도 점수들
    
    Returns:
        dict: 분석 결과 (detected_label, confidence, risk_score)
    """
    try:
        # 표준 출력을 임시로 리다이렉트하여 YOLO 로그 억제
        import io
        import contextlib
        
        # YOLO 모델 로드 (로그 억제)
        with contextlib.redirect_stdout(io.StringIO()):
            model = YOLO(model_path)
        
        # 이미지 분석 (로그 억제)
        with contextlib.redirect_stdout(io.StringIO()):
            results = model(image_path, verbose=False)
        
        # 결과 처리
        detected_objects = []
        max_confidence = 0
        best_label = "Unknown"
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # 클래스 ID와 신뢰도 가져오기
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    
                    # 클래스 이름 가져오기
                    class_name = model.names[class_id]
                    
                    # 바운딩박스 좌표 가져오기
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    
                    detected_objects.append({
                        'class': class_name,
                        'confidence': confidence,
                        'class_id': class_id,
                        'bbox': {
                            'x1': float(x1),
                            'y1': float(y1),
                            'x2': float(x2),
                            'y2': float(y2)
                        }
                    })
                    
                    # 가장 높은 신뢰도를 가진 객체 선택
                    if confidence > max_confidence:
                        max_confidence = confidence
                        best_label = class_name
        
        # 위험도 점수 계산
        risk_score = calculate_risk_score(best_label, max_confidence, existing_risk_scores)
        
        return {
            'success': True,
            'detected_label': best_label,
            'confidence': max_confidence,
            'risk_score': risk_score,
            'all_detections': detected_objects
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'detected_label': 'Unknown',
            'confidence': 0.0,
            'risk_score': 3.0
        }

def calculate_risk_score(label, confidence, existing_risk_scores=None):
    """
    라벨과 신뢰도에 따라 위험도 점수 계산 (R 코드 방식 적용)
    
    Args:
        label (str): 감지된 객체 라벨
        confidence (float): 신뢰도 (0-1)
        existing_risk_scores (list): 기존 데이터베이스의 위험도 점수들
    
    Returns:
        float: 위험도 점수 (0-5)
    """
    import numpy as np
    
    # 기본 위험도 점수 (라벨별)
    base_risk_scores = {
        'Fish_net': 4.5,
        'Fish_trap': 3.0,
        'Glass': 3.8,
        'Metal': 3.5,
        'Plastic': 4.0,
        'Rope': 3.2,
        'Rubber_etc': 3.3,
        'Rubber_tire': 3.4,
        'Wood': 2.8,
        'PET_Bottle': 3.1,  # PET 병 추가
        'Bottle': 3.1,      # 일반 병
        'Can': 3.2,         # 캔
        'Bag': 3.8,         # 비닐봉지
        'Container': 3.0    # 컨테이너
    }
    
    # 기본 위험도 점수 가져오기
    base_score = base_risk_scores.get(label, 3.0)
    
    # 신뢰도에 따른 조정 (신뢰도가 높을수록 위험도 증가)
    confidence_factor = 0.5 + (confidence * 0.5)  # 0.5 ~ 1.0
    
    # 초기 위험도 점수 계산
    initial_score = base_score * confidence_factor
    
    # R 코드 방식: vals_obs <- obs_risk$RiskSum 방식 적용
    if existing_risk_scores and len(existing_risk_scores) > 0:
        # vals_obs <- obs_risk$RiskSum
        vals_obs = np.array(existing_risk_scores)
        # vals_obs <- vals_obs[is.finite(vals_obs)]
        vals_obs = vals_obs[np.isfinite(vals_obs)]
        
        if len(vals_obs) > 0:
            # 극단치 컷 (5%, 95%) - cut_obs <- quantile(vals_obs, c(0.05, 0.95), na.rm = TRUE)
            cut_obs = np.percentile(vals_obs, [5, 95])
            
            # Winsorize - vals_wins <- pmin(pmax(vals_obs, cut_obs[1]), cut_obs[2])
            winsorized_score = np.clip(initial_score, cut_obs[0], cut_obs[1])
            
            # 5분위 계산 (0%, 20%, 40%, 60%, 80%, 100%) - qs_obs <- quantile(vals_wins, probs = seq(0, 1, 0.2), na.rm = TRUE)
            qs_obs = np.percentile(vals_obs, [0, 20, 40, 60, 80, 100])
            qs_obs = np.unique(qs_obs)
            
            # 5분위 구간에 맞춰 점수 조정 (R의 colorBin 방식)
            if len(qs_obs) > 1:
                # 5분위 구간 중 어느 구간에 속하는지 찾기
                for i in range(len(qs_obs) - 1):
                    if qs_obs[i] <= winsorized_score <= qs_obs[i + 1]:
                        # 해당 구간의 중간값으로 조정 (YlOrRd 팔레트 방식)
                        final_score = (qs_obs[i] + qs_obs[i + 1]) / 2
                        break
                else:
                    final_score = winsorized_score
            else:
                final_score = winsorized_score
        else:
            final_score = initial_score
    else:
        # 기존 데이터가 없는 경우 기본 방식 사용
        final_score = initial_score
    
    # 0-5 범위로 제한
    return min(5.0, max(0.0, final_score))

def main():
    """
    메인 함수 - 명령행 인자로 이미지 경로, 모델 경로, 기존 위험도 데이터를 받음
    """
    if len(sys.argv) < 3 or len(sys.argv) > 4:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python yolo_analyzer.py <image_path> <model_path> [existing_risk_scores_json]'
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = sys.argv[2]
    existing_risk_scores = None
    
    # 기존 위험도 데이터가 제공된 경우 파싱
    if len(sys.argv) == 4:
        try:
            existing_risk_scores = json.loads(sys.argv[3])
        except json.JSONDecodeError:
            print(json.dumps({
                'success': False,
                'error': 'Invalid JSON format for existing risk scores'
            }))
            sys.exit(1)
    
    # 파일 존재 확인
    if not os.path.exists(image_path):
        print(json.dumps({
            'success': False,
            'error': f'Image file not found: {image_path}'
        }))
        sys.exit(1)
    
    if not os.path.exists(model_path):
        print(json.dumps({
            'success': False,
            'error': f'Model file not found: {model_path}'
        }))
        sys.exit(1)
    
    # YOLO 분석 실행
    result = analyze_image_with_yolo(image_path, model_path, existing_risk_scores)
    
    # JSON 형태로 결과 출력
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()
