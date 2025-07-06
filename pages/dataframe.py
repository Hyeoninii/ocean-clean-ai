import streamlit as st
import pandas as pd

def dataframe_page():
    st.title("📊 탐지 데이터")
    df = pd.read_csv("ocean_risk.csv")
    st.dataframe(df)
