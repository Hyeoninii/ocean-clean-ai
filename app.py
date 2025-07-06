import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium
from branca.element import Template, MacroElement
import time

# 페이지 설정
st.set_page_config(page_title="Ocean Clean AI", layout="wide")

# 사이드바
st.sidebar.title("🌊 Ocean Clean AI")
page = st.sidebar.radio(
    "메뉴를 선택하세요",
    ("홈", "데이터프레임", "차트", "지도", "업로드")
)

# 홈
if page == "홈":
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

# 데이터프레임
elif page == "데이터프레임":
    st.title("📊 탐지 데이터")
    df = pd.read_csv("ocean_risk.csv")
    st.dataframe(df)

# 차트
elif page == "차트":
    st.title("📈 차트 예시")
    st.line_chart(pd.DataFrame({"x": [1, 2, 3, 4], "y": [10, 20, 10, 30]}))

# 지도
elif page == "지도":
    st.title("🗺️ 해양 쓰레기 위험 지도")

    # 데이터 로드
    df = pd.read_csv("ocean_risk.csv")

    # 위험도 구간 나누기 (min~max 기준 등간격)
    min_risk = df["RiskScore"].min()
    max_risk = df["RiskScore"].max()
    bins = pd.cut(df["RiskScore"], bins=5, labels=False)

    # 색상 매핑
    color_map = {
        0: "#2DC937",  # Very Low
        1: "#99C140",  # Low
        2: "#E7B416",  # Medium
        3: "#DB7B2B",  # High
        4: "#CC3232"   # Very High
    }

    # 한글 라벨 번역
    label_kor_map = {
        "Fish_net": "어망", "Plastic": "플라스틱", "Glass": "유리", "Metal": "금속",
        "Rope": "밧줄", "Wood": "목재", "Buoy": "부표", "Styrofoam": "스티로폼", "Trap": "통발"
    }

    # 라벨별 대표 이미지
    label_image_map = {
        "Fish_net": "https://www.busan.go.kr/files/editor/20230103094705584_Taejongdae.jpg",
        "Plastic": "https://cdn.pixabay.com/photo/2017/02/27/19/06/plastic-bottles-2102488_1280.jpg",
        "Glass": "https://cdn.pixabay.com/photo/2015/09/18/11/35/bottle-944759_1280.jpg",
        "Metal": "https://cdn.pixabay.com/photo/2014/10/13/09/15/can-486713_1280.jpg",
        "Rope": "https://cdn.pixabay.com/photo/2017/06/08/01/44/rope-2388535_1280.jpg",
        "Wood": "https://cdn.pixabay.com/photo/2017/08/30/07/57/wood-2695297_1280.jpg",
        "Styrofoam": "https://cdn.pixabay.com/photo/2022/11/28/12/34/styrofoam-7623346_1280.jpg",
        "Buoy": "https://cdn.pixabay.com/photo/2015/11/16/15/17/buoy-1042397_1280.jpg",
        "Trap": "https://cdn.pixabay.com/photo/2016/11/13/20/35/lobster-trap-1829137_1280.jpg"
    }

    # 지도 중심
    m = folium.Map(location=[df["Latitude"].mean(), df["Longitude"].mean()], zoom_start=10)

    # 마커 추가
    for idx, row in df.iterrows():
        lat = row["Latitude"]
        lon = row["Longitude"]
        label = row["Label"]
        label_kor = label_kor_map.get(label, label)
        risk = row["RiskScore"]
        bin_level = bins[idx]
        color = color_map.get(bin_level, "#000000")
        image_url = label_image_map.get(label, "")

        popup_html = f"""
        <b>종류:</b> {label_kor}<br>
        <b>위험도:</b> {risk:.2f}<br>
        """
        if image_url:
            popup_html += f'<img src="{image_url}" width="250">'

        folium.CircleMarker(
            location=[lat, lon],
            radius=8,
            color=color,
            fill=True,
            fill_color=color,
            fill_opacity=0.7,
            popup=folium.Popup(popup_html, max_width=300)
        ).add_to(m)

    # 위험도 범례 추가 (오른쪽 하단)
    legend_html = """
    <div style="
        position: fixed;
        bottom: 50px;
        right: 50px;
        z-index:9999;
        background-color:white;
        padding:10px;
        border:2px solid grey;
        border-radius:10px;
        font-size:14px;
    ">
    <b>위험도 등급</b><br>
    <i style="background:#2DC937;width:10px;height:10px;display:inline-block"></i> 매우 낮음<br>
    <i style="background:#99C140;width:10px;height:10px;display:inline-block"></i> 낮음<br>
    <i style="background:#E7B416;width:10px;height:10px;display:inline-block"></i> 보통<br>
    <i style="background:#DB7B2B;width:10px;height:10px;display:inline-block"></i> 높음<br>
    <i style="background:#CC3232;width:10px;height:10px;display:inline-block"></i> 매우 높음
    </div>
    """

    m.get_root().html.add_child(folium.Element(legend_html))
    st_folium(m, width=950, height=600)

elif page == "업로드":
    st.markdown(
       "<div style='font-size: 32px; font-weight: bold;'> 해양 쓰레기 사진을 업로드 후, <br> 아래 분석 결과를 확인해주세요! 📷</div>", 
       unsafe_allow_html=True
   )

    st.markdown("<div style='margin-top: 40px;'></div>", unsafe_allow_html=True)

    # 파일 업로더 (라벨 숨김)
    uploaded_file = st.file_uploader(
        label="",  # 기본 라벨 제거
        type=["jpg", "jpeg", "png"],
        label_visibility="collapsed"
    )

    # 업로드된 이미지가 있으면 화면에 표시
    if uploaded_file is not None:
        st.image(uploaded_file, caption="업로드한 이미지", use_container_width=True)

        # 여유 공간 추가
        st.markdown("---")
        st.write("")
        st.write("분석 진행 상황 :")

        # 진행 표시줄
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