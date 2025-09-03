import streamlit as st
import time
import os
from datetime import datetime
import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO

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
                time.sleep(0.01)
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
        
        if detected_objects:
            st.write("**감지된 객체:**")
            for i, obj in enumerate(detected_objects, 1):
                st.write(f"{i}. **{obj['class']}** (신뢰도: {obj['confidence']:.2f})")
            
            # 결과 이미지 표시 (바운딩 박스가 그려진 이미지)
            try:
                result_image = results[0].plot()
                st.image(result_image, caption="YOLO 분석 결과", use_container_width=True)
            except:
                st.image(uploaded_file, caption="업로드한 이미지", use_container_width=True)
        else:
            st.write("감지된 객체가 없습니다.")
        
        st.markdown("---")
        st.markdown(
            "<div style='font-size: 18px; font-weight: bold;'> 해당 이미지와 분석 결과를 신고 접수하였습니다. 감사합니다!😉</div>", 
            unsafe_allow_html=True
        )
    else:
        st.info("사진을 업로드하면 애니메이션이 시작됩니다.")