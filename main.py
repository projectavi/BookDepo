import requests
from bs4 import BeautifulSoup
import re
from selenium import webdriver
import time
from webdriver_manager.chrome import ChromeDriverManager

name = "the way of kings"

res = requests.get("https://1lib.in/s/The%20Way%20of%20Kings")

print(type(res.text))
print(res.status_code)

soup = BeautifulSoup(res.content, 'html.parser')

snippets = soup.select("h3")

#print(snippets)

links = []
anchors = []
names = []

for snip in snippets:
    #print(snip)
    anchors.append(snip.find("a"))


for anchor in anchors:
    #print(type(anchor))
    links.append("https://1lib.in" + anchor.get("href"))
    names.append(anchor.contents[0])

authors = soup.find_all(class_="color1")

for i in range(0, len(authors)):
    authors[i] = authors[i].contents[0]

#print(authors)

print(type(links[0]))

#links = [links[0]] only for testing the below

#Maybe can circumvent by using Selenium to click download links
"""for link in links:
    options = webdriver.ChromeOptions()
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--incognito')
    options.add_argument('--headless')
    driver = webdriver.Chrome(ChromeDriverManager().install(), chrome_options=options)

    driver.get("https://1lib.in/" + link)
    more_buttons = driver.find_element_by_id("btnCheckOtherFormats")
    if more_buttons.is_displayed():
        driver.execute_script("arguments[0].click();", more_buttons)
        time.sleep(1)
    page_source = driver.page_source
    # res_link = requests.get("https://1lib.in/" + link)
    soup_link = BeautifulSoup(page_source, 'html.parser')
    downloads = soup_link.find_all(class_="addDownloadedBook")
    print((len(downloads)))
    download_links = []
    for tag in downloads:
        download_links.append("https://1lib.in" + tag.get("href"))
    print(download_links)
"""

for i in range(0, len(links)):
    print(names[i] + "(" + authors[i] + ")" + ": " + links[i])