# !#python3 -m pip install beautifulsoup4
import requests
from bs4 import BeautifulSoup

response = requests.get("https://www.linkedin.com")
soup = BeautifulSoup(response.content, 'html.parser')

pretty = soup.prettify()
print(pretty)


headers = response.headers
print(headers)