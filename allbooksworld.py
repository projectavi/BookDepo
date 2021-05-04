import requests
from bs4 import BeautifulSoup
from selenium import webdriver
import time
from webdriver_manager.chrome import ChromeDriverManager

name = "the way of kings"

name = name.split()

url = "https://allbooksworld.com/?s=" + name[0]

for i in range(1, len(name)):
    url = url + "+" + name[i]

#print(url)

res = requests.get(url)

#print(type(res.text))
#print(res.status_code)

soup = BeautifulSoup(res.content, 'html.parser')

#print(soup)

snippets = soup.find_all(class_="entry-title post-title")

#print(snippets)

searchLinks = []
anchors = []
names = []
links = []

for snip in snippets:
    #print(snip)
    anchors.append(snip.find("a"))


for anchor in anchors:
    #print(type(anchor))
    searchLinks.append(anchor.get("href"))
    names.append(anchor.contents[0])

options = webdriver.ChromeOptions()
options.add_argument('--ignore-certificate-errors')
options.add_argument('--incognito')
#options.add_argument('--headless')
driver = webdriver.Chrome(ChromeDriverManager().install(), chrome_options=options)

#searchLinks = [searchLinks[4]]

for link in searchLinks:
    res = requests.get(link)
    soup = BeautifulSoup(res.content, 'html.parser')
    #print(soup)
    oneupload = soup.find_all("input", {"name":"downloadfile"})
    for i in range(0, len(oneupload)):
        oneupload[i] = oneupload[i]["value"]
    #print(oneupload)

    for dl in oneupload:

        driver.get(dl)
        time.sleep(6)
        more_buttons = driver.find_element_by_id("downloadbtn")
        if more_buttons.is_displayed():
            driver.execute_script("arguments[0].click();", more_buttons)
            time.sleep(1)
        page_source = driver.page_source

        soup = BeautifulSoup(page_source, 'html.parser')

        dlLink = soup.find(id="direct_link")

        dlLink = dlLink.find("a")

        dlLink = dlLink.get("href")

        links.append(dlLink)

return names, links