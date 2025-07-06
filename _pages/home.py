import streamlit as st

def home_page():
    st.title("🌏 Ocean Clean AI")
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("""
            해양 쓰레기의 위험도를 분석하고 시각화하는 AI 기반 환경 플랫폼입니다.

            - 🚢 선박 항로 및 어업 지역 보호
            - 🐟 해양 생태계 데이터 기반 보호
            - 📷 AI 이미지 분석 + 위험도 지도 시각화
        """)

    with col2:
        st.image(
            "_assets/image.png",
            width=400,
        )

    # 캡션을 페이지 맨 아래 중앙에 고정
    st.markdown(
        """
        <div style='position:fixed; left:0; bottom:0; width:100%; text-align:center; margin-bottom:10px; z-index:100;'>
            <span style='font-size:16px; color:gray;'>해양 보호의 첫걸음, Ocean Clean AI</span>
        </div>
        """,
        unsafe_allow_html=True
    )