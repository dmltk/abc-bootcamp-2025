import requests
from bs4 import BeautifulSoup

page_url = "https://www.melon.com/chart/age/list.htm"

prams = {
    "idx":"1",
    "chartType":"YE",
    "chartGenre":"KPOP",
    "chartDate":"2019",
    "moved":"Y",
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
}

res=requests.get(page_url, params=prams, headers=headers)
print(res) #상태코드 출력

html: str = res.text
with open("melon_dump.html", "wt", encoding="utf8") as f:
    f.write(html)
    print("written to", f.name)

soup= BeautifulSoup(html, "html.parser")

el_list = soup.select(".lst50")
for el in el_list:
    song_el = el.select_one("[href*=playSong]")
    song_title = song_el.strip()
    print(song_title)

"""
# --- BeautifulSoup4로 melon_dump.html 파싱 및 JSON 저장 ---
import json
from bs4 import BeautifulSoup
import re

def parse_melon_chart(html_path, output_json_path):
    with open(html_path, "rt", encoding="utf8") as f:
        soup = BeautifulSoup(f, "html.parser")

    chart = []
    # 1~50위: lst50, 51~100위: lst100
    for tr in soup.select("tr.lst50, tr.lst100"):
        tds = tr.find_all("td")
        if not tds or len(tds) < 4:
            continue  # 데이터 없는 행 skip

        # 순위
        rank = tds[1].get_text(strip=True) if len(tds) > 1 else None
        # 곡정보 영역
        song_info_td = tds[3] if len(tds) > 3 else None
        song_name = artist = album = song_id = album_id = None
        if song_info_td:
            # 곡명
            song_name_tag = song_info_td.find("div", class_="ellipsis rank01")
            if song_name_tag:
                song_name = song_name_tag.get_text(strip=True)
            # 가수명
            artist_tag = song_info_td.find("div", class_="ellipsis rank02")
            if artist_tag:
                artist = artist_tag.get_text(strip=True)
            # 앨범명
            album_tag = song_info_td.find("div", class_="ellipsis rank03")
            if album_tag:
                album = album_tag.get_text(strip=True)
            # 곡ID, 앨범ID 추출 (a href의 javascript에서)
            a_tags = song_info_td.find_all("a", href=True)
            for a in a_tags:
                # 예: javascript:melon.play.playSong('19030101','12345678');
                m = re.search(r"playSong\('[^']*','(\d+)'\)", a['href'])
                if m:
                    song_id = m.group(1)
                m2 = re.search(r"goAlbumDetail\('\d+','(\d+)'\)", a['href'])
                if m2:
                    album_id = m2.group(1)

        # Fallback: 앨범명은 tds[2] 등에서 추출 가능
        if not album and len(tds) > 2:
            album = tds[2].get_text(strip=True)

        # 최소 곡명, 가수명, 순위 중 하나라도 있으면 추가
        if song_name or artist or rank:
            chart.append({
                "rank": rank,
                "song_name": song_name,
                "artist": artist,
                "album": album,
                "song_id": song_id,
                "album_id": album_id
            })

    with open(output_json_path, "wt", encoding="utf8") as f:
        json.dump(chart, f, ensure_ascii=False, indent=2)
    print(f"{output_json_path} written. 곡 수: {len(chart)}")


# melon_dump.html -> melon_chart_2019.json
parse_melon_chart("melon_dump.html", "melon_chart_2019.json")
"""