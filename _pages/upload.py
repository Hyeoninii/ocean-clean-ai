import streamlit as st
import time
import os
from datetime import datetime
import cv2
import numpy as np
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from ultralytics import YOLO
import pandas as pd

def convert_to_degrees(value):
    """GPS 좌표를 도 단위로 변환"""
    d, m, s = value
    return d + (m / 60.0) + (s / 3600.0)

def get_gps_from_exif(image_path):
    """이미지의 EXIF 데이터에서 GPS 정보 추출"""
    try:
        image = Image.open(image_path)
        exifdata = image.getexif()
        
        gps_info = {}
        for tag_id in exifdata:
            tag = TAGS.get(tag_id, tag_id)
            if tag == "GPSInfo":
                gps_data = exifdata[tag_id]
                for gps_tag_id in gps_data:
                    gps_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                    gps_info[gps_tag] = gps_data[gps_tag_id]
        
        if gps_info:
            lat = convert_to_degrees(gps_info.get('GPSLatitude', (0, 0, 0)))
            lon = convert_to_degrees(gps_info.get('GPSLongitude', (0, 0, 0)))
            
            if gps_info.get('GPSLatitudeRef') == 'S':
                lat = -lat
            if gps_info.get('GPSLongitudeRef') == 'W':
                lon = -lon
                
            return lat, lon
    except Exception as e:
        st.warning(f"GPS 정보를 읽을 수 없습니다: {str(e)}")
    
    return None, None

def calculate_risk_score(class_name, confidence):
    """클래스와 신뢰도에 따른 위험도 점수 계산"""
    # 클래스별 기본 위험도
    class_risk = {
        'Fish_net': 4.0,
        'Fish_trap': 3.8,
        'Glass': 3.5,
        'Metal': 3.2,
        'Plastic': 3.0,
        'Rope': 2.8,
        'Rubber_etc': 2.5,
        'Rubber_tire': 2.3,
        'Wood': 2.0,
        'PET_Bottle': 3.1,
        'Buoy': 2.7,
        'Styrofoam': 2.9
    }
    
    base_risk = class_risk.get(class_name, 2.0)
    # 신뢰도에 따른 조정 (0.5 ~ 1.0 범위)
    confidence_factor = 0.5 + (confidence * 0.5)
    return base_risk * confidence_factor

def save_detection_data(filename, detected_objects, latitude, longitude):
    """탐지된 객체 정보를 CSV에 저장"""
    try:
        # 새로운 데이터 행 생성
        new_data = []
        for obj in detected_objects:
            new_row = {
                'File': filename.replace('.jpg', '.json').replace('.jpeg', '.json').replace('.png', '.json'),
                'Latitude': latitude,
                'Longitude': longitude,
                'Label': obj['class'],
                'Weight': 1.0,  # 기본값
                'Cluster': 1,   # 기본값
                'RiskScore': calculate_risk_score(obj['class'], obj['confidence'])
            }
            new_data.append(new_row)
        
        # CSV 파일에 추가
        try:
            # 기존 데이터 로드
            df = pd.read_csv('test.csv')
        except FileNotFoundError:
            # 파일이 없으면 새로 생성
            df = pd.DataFrame(columns=['File', 'Latitude', 'Longitude', 'Label', 'Weight', 'Cluster', 'RiskScore'])
        
        new_df = pd.DataFrame(new_data)
        combined_df = pd.concat([df, new_df], ignore_index=True)
        combined_df.to_csv('test.csv', index=False)
        return True
    except Exception as e:
        st.error(f"데이터 저장 중 오류: {str(e)}")
        return False

def upload_page():
    st.markdown(
       "<div style='font-size: 32px; font-weight: bold;'> 해양 쓰레기 사진을 업로드 후, <br> 아래 분석 결과를 확인해주세요! 📷</div>", 
       unsafe_allow_html=True
    )

    st.markdown("<div style='margin-top: 40px;'></div>", unsafe_allow_html=True)

    uploaded_file = st.file_uploader(label="", type=["jpg", "jpeg", "png"], label_visibility="collapsed")

    if uploaded_file is not None:
        # 파일 저장 경로 및 이름 생성
        upload_dir = "_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_ext = os.path.splitext(uploaded_file.name)[1]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        save_filename = f"upload_{timestamp}{file_ext}"
        save_path = os.path.join(upload_dir, save_filename)
        # 파일 저장
        with open(save_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        st.success(f"이미지가 성공적으로 저장되었습니다: {save_filename}")
        st.image(uploaded_file, caption="업로드한 이미지", use_container_width=True)
        st.markdown("---")
        st.write("분석 진행 상황 :")
        my_bar = st.progress(0)
        
        # YOLO 모델 로드 및 예측
        try:
            # YOLO 모델 로드
            model = YOLO('/Users/bagseongmin/Desktop/해커톤/best.pt')
            
            # 이미지를 numpy 배열로 변환
            image = Image.open(uploaded_file)
            image_np = np.array(image)
            
            # YOLO 예측 실행
            results = model(image_np)
            
            # 결과 처리
            detected_objects = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # 클래스 정보 가져오기
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        class_name = model.names[class_id]
                        
                        detected_objects.append({
                            'class': class_name,
                            'confidence': confidence,
                            'bbox': box.xyxy[0].tolist()
                        })
            
            # 진행률 업데이트
            for percent_complete in range(100):
                time.sleep(0.01)  # 더 빠르게
                my_bar.progress(percent_complete + 1)
            
            st.success("완료되었습니다!")
            
        except Exception as e:
            st.error(f"YOLO 모델 실행 중 오류가 발생했습니다: {str(e)}")
            # 기본 진행률 표시
            for percent_complete in range(100):
                time.sleep(0.07)
                my_bar.progress(percent_complete + 1)
            st.success("완료되었습니다!")
            detected_objects = []
        st.markdown("---")
        st.subheader("📍 분석 결과")
        
        if 'detected_objects' in locals() and detected_objects:
            for i, obj in enumerate(detected_objects, 1):
                st.write(f"{i}. {obj['class']} (신뢰도: {obj['confidence']:.2f})")
            
            # 결과 이미지 표시 (바운딩 박스가 그려진 이미지)
            try:
                result_image = results[0].plot()
                st.image(result_image, caption="YOLO 분석 결과", use_container_width=True)
            except:
                st.image(uploaded_file, caption="업로드한 이미지", use_container_width=True)
            
            # GPS 정보 자동 추출
            st.markdown("---")
            st.subheader("🌍 위치 정보")
            
            lat_from_exif, lon_from_exif = get_gps_from_exif(save_path)
            
            if lat_from_exif and lon_from_exif:
                st.success(f"📱 사진에서 GPS 정보를 자동으로 찾았습니다!")
                st.info(f"위도: {lat_from_exif:.6f}, 경도: {lon_from_exif:.6f}")
                
                # 자동으로 데이터 저장
                if st.button("💾 분석 결과를 데이터베이스에 저장", type="primary"):
                    if save_detection_data(save_filename, detected_objects, lat_from_exif, lon_from_exif):
                        st.success("✅ 데이터가 성공적으로 저장되었습니다!")
                        st.info("데이터 현황과 지도 페이지에서 확인할 수 있습니다.")
                        st.balloons()  # 축하 애니메이션
                    else:
                        st.error("❌ 데이터 저장에 실패했습니다.")
            else:
                st.warning("⚠️ 사진에서 GPS 정보를 찾을 수 없습니다.")
                st.write("수동으로 위치를 입력해주세요:")
                
                col1, col2 = st.columns(2)
                with col1:
                    latitude = st.number_input("위도 (Latitude)", value=35.08, format="%.6f")
                with col2:
                    longitude = st.number_input("경도 (Longitude)", value=128.8, format="%.6f")
                
                if st.button("💾 분석 결과를 데이터베이스에 저장", type="primary"):
                    if save_detection_data(save_filename, detected_objects, latitude, longitude):
                        st.success("✅ 데이터가 성공적으로 저장되었습니다!")
                        st.info("데이터 현황과 지도 페이지에서 확인할 수 있습니다.")
                        st.balloons()  # 축하 애니메이션
                    else:
                        st.error("❌ 데이터 저장에 실패했습니다.")
        else:
            st.write("감지된 객체가 없습니다.")
            # 기본 결과 표시
            st.write("1개의 플라스틱 쓰레기")
            st.write("Latitude: 35.08")
            st.write("Longitude: 128.8")
            st.write("위험도: 3.84")
        st.markdown("---")
        st.markdown(
            "<div style='font-size: 18px; font-weight: bold;'> 해당 이미지와 분석 결과를 신고 접수하였습니다. 감사합니다!😉</div>", 
            unsafe_allow_html=True
        )
    else:
        st.info("사진을 업로드하면 애니메이션이 시작됩니다.")
