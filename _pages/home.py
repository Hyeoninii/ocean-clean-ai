import streamlit as st

def home_page():
    st.title("🌏 Ocean Clean AI")
    st.markdown("""
        해양 쓰레기의 위험도를 분석하고 시각화하는 AI 기반 환경 플랫폼입니다.

        - 🚢 선박 항로 및 어업 지역 보호
        - 🐟 해양 생태계 데이터 기반 보호
        - 📷 AI 이미지 분석 + 위험도 지도 시각화
    """)
    st.image(
        "https://images.unsplash.com/photo-1598511720561-31e264efc04c",
        use_column_width=True,
        caption="해양 보호의 첫걸음, Ocean Clean AI"
    )
