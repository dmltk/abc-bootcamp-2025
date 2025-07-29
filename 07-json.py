import requests
import json

url="https://pyhub.kr/melon/20231204.json"

response=requests.get(url)
print(response)
# print(type(response.text))

# string -> object : deserialize (역직렬화)
json_string:str=response
response_obj=json.loads(json_string)
print(type(response.text))
print(len(response.text))

for song in response_obj:
    print(song["곡명"],song["가수"])