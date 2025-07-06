import streamlit as st
import pandas as pd
import random

def get_waste_image(label):
    """쓰레기 종류에 따른 이미지 URL 반환"""
    images = {
        "Fish_net": "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=어망",
        "Fish_trap": "https://via.placeholder.com/400x300/50C878/FFFFFF?text=어구", 
        "Glass": "https://via.placeholder.com/400x300/87CEEB/FFFFFF?text=유리",
        "Metal": "https://via.placeholder.com/400x300/C0C0C0/FFFFFF?text=금속",
        "Plastic": "https://via.placeholder.com/400x300/32CD32/FFFFFF?text=플라스틱",
        "Rope": "https://via.placeholder.com/400x300/8B4513/FFFFFF?text=로프",
        "Rubber_etc": "https://via.placeholder.com/400x300/000000/FFFFFF?text=고무류",
        "Rubber_tire": "https://via.placeholder.com/400x300/2F4F4F/FFFFFF?text=고무타이어",
        "Wood": "https://via.placeholder.com/400x300/DEB887/FFFFFF?text=목재"
    }
    return images.get(label, "https://via.placeholder.com/400x300/808080/FFFFFF?text=기타")

def get_waste_category(label):
    """쓰레기 종류를 한국어 카테고리로 변환"""
    categories = {
        "Fish_net": "어망",
        "Fish_trap": "어구", 
        "Glass": "유리",
        "Metal": "금속",
        "Plastic": "플라스틱",
        "Rope": "로프",
        "Rubber_etc": "고무류",
        "Rubber_tire": "고무타이어",
        "Wood": "목재"
    }
    return categories.get(label, "기타")

def get_risk_level(risk_score):
    """위험도 점수에 따른 레벨 반환"""
    if risk_score >= 4.0:
        return "🔴 매우 높음"
    elif risk_score >= 3.5:
        return "🟠 높음"
    elif risk_score >= 3.0:
        return "🟡 보통"
    else:
        return "🟢 낮음"

def get_location_name(lat, lon):
    """위도, 경도에 따른 지역 이름 반환"""
    # 제주 지역
    if 33.2 <= lat <= 33.3 and 126.2 <= lon <= 126.7:
        if 126.2 <= lon <= 126.4:
            return "제주 서귀포"
        elif 126.4 <= lon <= 126.5:
            return "제주 제주시"
        elif 126.6 <= lon <= 126.7:
            return "제주 성산"
        else:
            return "제주 해역"
    
    # 전남 지역 (여수, 통영, 거제)
    elif 34.7 <= lat <= 34.8 and 127.6 <= lon <= 128.1:
        if 127.6 <= lon <= 127.8:
            return "전남 여수"
        elif 127.8 <= lon <= 128.1:
            return "전남 순천"
        else:
            return "전남 해역"
    
    elif 34.8 <= lat <= 35.0 and 128.0 <= lon <= 128.5:
        if 128.0 <= lon <= 128.2:
            return "전남 여수"
        elif 128.2 <= lon <= 128.4:
            return "전남 통영"
        elif 128.4 <= lon <= 128.5:
            return "경남 거제"
        else:
            return "남해 해역"
    
    # 부산 지역
    elif 35.0 <= lat <= 35.2 and 128.9 <= lon <= 129.2:
        if 129.0 <= lon <= 129.1:
            return "부산 광안리"
        elif 129.1 <= lon <= 129.2:
            return "부산 해운대"
        else:
            return "부산 해역"
    
    elif 35.3 <= lat <= 35.4 and 129.2 <= lon <= 129.3:
        return "부산 기장"
    
    # 울산 지역
    elif 35.5 <= lat <= 35.6 and 129.4 <= lon <= 129.5:
        return "울산 울주"
    
    # 강원 지역
    elif 37.0 <= lat <= 37.1 and 129.4 <= lon <= 129.5:
        return "강원 동해"
    
    # 충남 지역
    elif 36.7 <= lat <= 36.8 and 126.1 <= lon <= 126.2:
        return "충남 태안"
    
    # 전북 지역
    elif 34.7 <= lat <= 34.8 and 126.3 <= lon <= 126.4:
        return "전북 군산"
    
    # 기타 지역들
    elif 34.9 <= lat <= 35.0 and 128.4 <= lon <= 128.5:
        return "경남 거제"
    elif 34.8 <= lat <= 34.9 and 128.7 <= lon <= 128.8:
        return "경남 창원"
    elif 35.0 <= lat <= 35.1 and 128.4 <= lon <= 128.5:
        return "경남 김해"
    elif 37.5 <= lat <= 37.6 and 129.1 <= lon <= 129.2:
        return "강원 강릉"
    elif 38.0 <= lat <= 38.1 and 128.6 <= lon <= 128.7:
        return "강원 속초"
    else:
        return "기타 해역"

def dataframe_page():
    st.title("🌊 해양 쓰레기 탐지 데이터")
    
    # 데이터 로드
    df = pd.read_csv("ocean_risk.csv")
    
    # 검색 및 필터링 옵션
    col1, col2 = st.columns(2)
    
    with col1:
        waste_type = st.selectbox(
            "쓰레기 종류",
            ["전체"] + list(df['Label'].unique())
        )
    
    with col2:
        risk_filter = st.selectbox(
            "위험도 필터",
            ["전체", "높음 (3.5+)", "보통 (3.0-3.5)", "낮음 (3.0 미만)"]
        )
    
    # 필터링 적용
    filtered_df = df.copy()
    
    if waste_type != "전체":
        filtered_df = filtered_df[filtered_df['Label'] == waste_type]
    
    if risk_filter == "높음 (3.5+)":
        filtered_df = filtered_df[filtered_df['RiskScore'] >= 3.5]
    elif risk_filter == "보통 (3.0-3.5)":
        filtered_df = filtered_df[(filtered_df['RiskScore'] >= 3.0) & (filtered_df['RiskScore'] < 3.5)]
    elif risk_filter == "낮음 (3.0 미만)":
        filtered_df = filtered_df[filtered_df['RiskScore'] < 3.0]
    
    # 페이지당 20개씩 고정
    items_per_page = 20
    total_items = len(filtered_df)
    total_pages = (total_items + items_per_page - 1) // items_per_page
    
    # 현재 페이지 (기본값: 1)
    if 'current_page' not in st.session_state:
        st.session_state.current_page = 1
    
    # 페이지 계산
    start_idx = (st.session_state.current_page - 1) * items_per_page
    end_idx = min(start_idx + items_per_page, total_items)
    page_df = filtered_df.iloc[start_idx:end_idx]
    
    # 통계 정보 표시
    st.markdown("---")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("총 탐지 건수", f"{len(filtered_df):,}건")
    
    with col2:
        avg_risk = filtered_df['RiskScore'].mean()
        st.metric("평균 위험도", f"{avg_risk:.2f}")
    
    with col3:
        if len(filtered_df) > 0:
            most_common = filtered_df['Label'].mode().iloc[0]
            st.metric("가장 많은 쓰레기", get_waste_category(most_common))
        else:
            st.metric("가장 많은 쓰레기", "없음")
    
    with col4:
        if len(filtered_df) > 0:
            max_risk = filtered_df['RiskScore'].max()
            st.metric("최고 위험도", f"{max_risk:.2f}")
        else:
            st.metric("최고 위험도", "0.00")
    
    st.markdown("---")
    
    # 카드 형태로 데이터 표시
    if len(page_df) > 0:
        # 3열 그리드로 카드 배치
        cols = st.columns(3)
        
        for i, (_, row) in enumerate(page_df.iterrows()):
            col_idx = i % 3
            with cols[col_idx]:
                with st.container():
                    st.markdown("""
                    <style>
                    .waste-card {
                        border: 1px solid #ddd;
                        border-radius: 10px;
                        padding: 15px;
                        margin: 10px 0;
                        background: white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .waste-card:hover {
                        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                        transform: translateY(-2px);
                        transition: all 0.3s ease;
                    }
                    </style>
                    """, unsafe_allow_html=True)
                    
                    # 카드 시작
                    st.markdown('<div class="waste-card">', unsafe_allow_html=True)
                    
                    # 이미지
                    try:
                        image_url = get_waste_image(row['Label'])
                        st.image(image_url, use_container_width=True)
                    except Exception as e:
                        # 이미지 로딩 실패시 대체 텍스트 표시
                        st.markdown(f"""
                        <div style="
                            width: 100%; 
                            height: 200px; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            border-radius: 10px;
                            color: white;
                            font-size: 18px;
                            font-weight: bold;
                        ">
                            {get_waste_category(row['Label'])}
                        </div>
                        """, unsafe_allow_html=True)
                    
                    # 주요 정보
                    st.markdown(f"**주요 쓰레기**: {get_waste_category(row['Label'])}")
                    st.markdown(f"**위험도**: {row['RiskScore']:.1f} ({get_risk_level(row['RiskScore'])})")
                    st.markdown(f"**위치**: {get_location_name(row['Latitude'], row['Longitude'])}")
                    
                    # 카드 끝
                    st.markdown('</div>', unsafe_allow_html=True)
    else:
        st.warning("조건에 맞는 데이터가 없습니다.")
    
    # 페이지네이션 (맨 아래)
    if total_pages > 1:
        st.markdown("---")
        st.markdown("### 페이지 네비게이션")
        
        col1, col2, col3, col4, col5 = st.columns(5)
        
        with col1:
            if st.button("◀ 이전", disabled=st.session_state.current_page == 1):
                st.session_state.current_page = max(1, st.session_state.current_page - 1)
                st.rerun()
        
        with col2:
            st.markdown(f"**{st.session_state.current_page} / {total_pages}**")
        
        with col3:
            if st.button("다음 ▶", disabled=st.session_state.current_page == total_pages):
                st.session_state.current_page = min(total_pages, st.session_state.current_page + 1)
                st.rerun()
        
        with col4:
            if st.button("처음"):
                st.session_state.current_page = 1
                st.rerun()
        
        with col5:
            if st.button("마지막"):
                st.session_state.current_page = total_pages
                st.rerun()
    
    # 원본 데이터 테이블 (접을 수 있음)
    with st.expander("📋 원본 데이터 테이블 보기"):
        st.dataframe(filtered_df)
