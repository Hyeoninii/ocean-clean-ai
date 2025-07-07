# 📁 app.py
import streamlit as st

st.set_page_config(page_title="Ocean Clean AI", layout="wide")
st.sidebar.title("🌊 Ocean Clean AI")
page = st.sidebar.radio(
    "메뉴를 선택하세요",
    ("홈", "데이터프레임", "지도", "업로드")
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

if page == "홈":
    from _pages.home import home_page
    home_page()

elif page == "데이터프레임":
    from _pages.dataframe import dataframe_page
    dataframe_page()

elif page == "지도":
    from _pages.map import map_page
    map_page()

elif page == "업로드":
    from _pages.upload import upload_page
    upload_page()
