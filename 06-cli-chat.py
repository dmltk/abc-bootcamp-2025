from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()
client = OpenAI()

converstions=[
    # {"role":"system",
    #  "content":"영어 상황극을 해보자. 스타벅스에서 커피를 구매. 너는 점원. 나는 손님"},
    # {"role":"user","content":"대화를 시작해보자."}
]

# response = client.responses.create(
#     model="gpt-4o",
#     input=converstions,
# )
# assistant_content:str=response.output_text
# print("[AI]",assistant_content)
# converstions.append({
#     "role":"assistant",
#     "content":assistant_content
# })
while True:
    user_content=input("[Human] ").strip()
    if user_content:
        converstions.append({
            "role":"assistant",
            "content":user_content
        }) 
        response = client.responses.create(
        model="gpt-4o",
        input=converstions,
        )
        assistant_content:str=response.output_text
        print("[AI]",assistant_content)
        converstions.append({
            "role":"assistant",
            "content":assistant_content
        })
    else:
        print("대화를 종료하겠습니다")
        break
