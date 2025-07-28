import streamlit as st
from ai import get_personality_analysis
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="AI 관상 보기",page_icon="<*>", layout="centered")
st.title("<> AI 관상 보기 프로그램 <>")
st.write("---")
st.write("안녕하세요! AI 관상가입니다.")
st.write("당신의 얼굴 특징을 알려주시면 성격과 미래를 분석해드릴게요.")

face_desc=st.text_area(
    "얼굴 특징을 입력하세요:", 
    placeholder="예시: 둥근 얼굴, 큰 눈, 높은 코, 두꺼운 입술 등",
    height=100
)
face_desc=face_desc.strip()

# 분석 버튼
if st.button("<> 관상 분석하기 <>", type="primary"):
    if face_desc:
        # 로딩 표시
        with st.spinner("관상을 분석 중입니다..."):
            st.write("clicked "+face_desc)
            result = get_personality_analysis(face_desc)
            # 결과 표시
            st.write("----")
            st.subheader("관상 분석 결과")
            st.info(result)
            st.success("분석이 완료되었습니다. 감사합니다!")
    else:
        st.warning("얼굴 특징을 입력해주세요!")