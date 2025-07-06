import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium

def map_page():
    st.title("🗺️ 해양 쓰레기 위험 지도")
    df = pd.read_csv("ocean_risk.csv")

    min_risk = df["RiskScore"].min()
    max_risk = df["RiskScore"].max()
    bins = pd.cut(df["RiskScore"], bins=5, labels=False)

    color_map = {
        0: "#2DC937", 1: "#99C140", 2: "#E7B416", 3: "#DB7B2B", 4: "#CC3232"
    }

    label_kor_map = {
        "Fish_net": "어망", "Plastic": "플라스틱", "Glass": "유리", "Metal": "금속",
        "Rope": "밧줄", "Wood": "목재", "Buoy": "부표", "Styrofoam": "스티로폼", "Trap": "통발"
    }

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

    m = folium.Map(location=[df["Latitude"].mean(), df["Longitude"].mean()], zoom_start=10)

    for idx, row in df.iterrows():
        lat, lon, label, risk = row["Latitude"], row["Longitude"], row["Label"], row["RiskScore"]
        label_kor = label_kor_map.get(label, label)
        bin_level = bins[idx]
        color = color_map.get(bin_level, "#000000")
        image_url = label_image_map.get(label, "")

        popup_html = f"<b>종류:</b> {label_kor}<br><b>위험도:</b> {risk:.2f}<br>"
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

    legend_html = """
    <div style="
        position: fixed; bottom: 50px; right: 50px; z-index:9999;
        background-color:white; padding:10px;
        border:2px solid grey; border-radius:10px; font-size:14px;">
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
