import streamlit as st
import time
import os
from datetime import datetime

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
        for percent_complete in range(100):
            time.sleep(0.07)
            my_bar.progress(percent_complete + 1)

        st.success("완료되었습니다!")
        st.markdown("---")
        st.subheader("📍 분석 결과")
        st.write("2개의 플라스틱 쓰레기")
        st.write("Latitude: 355")
        st.write("Longitude: 277")
        st.write("위험도: 3.84")
        st.markdown("---")
        st.markdown(
            "<div style='font-size: 18px; font-weight: bold;'> 해당 이미지와 분석 결과를 신고 접수하였습니다. 감사합니다!😉</div>", 
            unsafe_allow_html=True
        )
    else:
        st.info("사진을 업로드하면 애니메이션이 시작됩니다.")
