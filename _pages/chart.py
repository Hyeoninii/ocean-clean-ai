import streamlit as st
import pandas as pd

def chart_page():
    st.title("📈 차트 예시")
    st.line_chart(pd.DataFrame({"x": [1, 2, 3, 4], "y": [10, 20, 10, 30]}))
