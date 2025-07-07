import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium
import os
import base64

def map_page():
    st.title("🗺️ 해양 쓰레기 위험 지도")

    map_type = st.radio(
        "지도 종류를 선택하세요:",
        ('위험도 등급 지도', '위험도 범위 지도')
    )

    if map_type == '위험도 등급 지도':
        df = pd.read_csv("test.csv")

        quantiles = df['RiskScore'].quantile([0.2, 0.4, 0.6, 0.8]).to_dict()
        q1, q2, q3, q4 = quantiles[0.2], quantiles[0.4], quantiles[0.6], quantiles[0.8]

        def get_risk_color(score):
            if score >= q4:
                return "red"
            elif score >= q3:
                return "orangered"
            elif score >= q2:
                return "orange"
            elif score >= q1:
                return "yellow"
            else:
                return "greenyellow"


        label_kor_map = {
            "Fish_net": "어망", "Plastic": "플라스틱", "Glass": "유리", "Metal": "금속",
            "Rope": "밧줄", "Wood": "목재", "Buoy": "부표", "Styrofoam": "스티로폼", "Trap": "통발",
            "Rubber_etc": "기타고무류", "Rubber_tire": "기타타이어류",
            "Etc": "기타"
        }

        m = folium.Map(location=[df["Latitude"].mean(), df["Longitude"].mean()], zoom_start=10)

        for idx, row in df.iterrows():
            lat, lon, label, risk = row["Latitude"], row["Longitude"], row["Label"], row["RiskScore"]
            label_kor = label_kor_map.get(label, label)
            color = get_risk_color(risk)
            
            image_filename = row['File'].replace('.json', '.jpg')
            image_path = os.path.join('_uploads', image_filename)

            popup_html = f"<b>종류:</b> {label_kor}<br><b>위험도:</b> {risk:.2f}<br>"
            
            if os.path.exists(image_path):
                with open(image_path, 'rb') as f:
                    encoded = base64.b64encode(f.read()).decode()
                popup_html += f'<img src="data:image/jpeg;base64,{encoded}" width="250">'
            else:
                popup_html += '<i>이미지 없음</i>'

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
        <i style="background:red;width:10px;height:10px;display:inline-block"></i> 매우 높음 (상위 20%)<br>
        <i style="background:orangered;width:10px;height:10px;display:inline-block"></i> 높음 (상위 20-40%)<br>
        <i style="background:orange;width:10px;height:10px;display:inline-block"></i> 보통 (상위 40-60%)<br>
        <i style="background:yellow;width:10px;height:10px;display:inline-block"></i> 낮음 (하위 20-40%)<br>
        <i style="background:greenyellow;width:10px;height:10px;display:inline-block"></i> 매우 낮음 (하위 20%)
        </div>
        """
        m.get_root().html.add_child(folium.Element(legend_html))
        st_folium(m, width=950, height=600)
    else:
        st.image("mapRange/mapColor.jpg", caption="위험도 범위 지도")
