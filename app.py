# 📁 app.py
import streamlit as st

st.set_page_config(page_title="Ocean Clean AI", layout="wide")
st.sidebar.title("🌊 Ocean Clean AI")
page = st.sidebar.radio(
    "메뉴를 선택하세요",
    ("홈", "데이터프레임", "차트", "지도", "업로드")
)

if page == "홈":
    from pages.home import home_page
    home_page()

elif page == "데이터프레임":
    from pages.dataframe import dataframe_page
    dataframe_page()

elif page == "차트":
    from pages.chart import chart_page
    chart_page()

elif page == "지도":
    from pages.map import map_page
    map_page()

elif page == "업로드":
    from pages.upload import upload_page
    upload_page()
