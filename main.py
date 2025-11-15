# !#python3 -m pip install beautifulsoup4
import requests
from bs4 import BeautifulSoup

GITHUB_GIST_TOKEN=os.env["GIST_TOKEN"]
print("GITHUB_GIST_TOKEN")
if len(GITHUB_GIST_TOKEN) > 2:
    print(GITHUB_GIST_TOKEN[0:2])


response = requests.get("https://www.linkedin.com")
soup = BeautifulSoup(response.content, 'html.parser')

pretty = soup.prettify()
print(pretty)


headers = response.headers
print(headers)