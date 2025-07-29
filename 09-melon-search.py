import json
import time
import requests

def melon_serch(query: str) -> list:
    search_url="https://www.melon.com/search/keyword/index.json"
    # Query Parameters
    params={
        "jscallback":"_",
        "query":"idol",
        "_":int(time.time()),
    }
    headers={
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
    }
    res=requests.get(search_url,params=params,headers=headers)
    
    if res.status_code==200:
        # return res.json()
        # response format : json(o), jsonp(o)
        jsonp_string=res.text
        json_string=jsonp_string[-2:2] # hard coding
        return json_string
    return []

# 현재 소스파일이 파이썬 실행의 진입점일 때
if __name__ == "__main__":
    print(melon_serch("idol"))
