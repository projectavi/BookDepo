import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import sys
import math
import os
import time

GOOGLE_CHROME_PATH = '/app/.apt/usr/bin/google_chrome'
CHROMEDRIVER_PATH = '/app/.chromedriver/bin/chromedriver'

def onelib_sel(name):
    name = name.split()

    url = "https://1lib.in/s/" + name[0]

    for i in range(1, len(name)):
        url = url + "%20" + name[i]

    #print(url)

    #Maybe can circumvent by using Selenium to click download links
    options = webdriver.ChromeOptions()
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--incognito')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--headless')
    #driver = webdriver.Chrome(ChromeDriverManager().install(), chrome_options=options)
    options.binary_location = GOOGLE_CHROME_PATH
    options.binary_location = os.getenv('GOOGLE_CHROME_BIN')
    driver = webdriver.Chrome(executable_path=os.getenv('CHROME_EXECUTABLE_PATH'), chrome_options=options)

    driver.get(url)
    WebDriverWait(driver, 15)

    # try:
    #     element = WebDriverWait(driver, 30).until(
    #         EC.presence_of_element_located((By.ID, "searchResultBox"))
    #     )
    # finally:
    #     print("element not found")

    page_source = driver.page_source

    print(page_source)
    # res_link = requests.get("https://1lib.in/" + link)
    soup = BeautifulSoup(page_source, 'html.parser')
    
    snippets = soup.find_all("a", {'style': 'text-decoration: underline;'})

    print(snippets)

    #print(snippets)

    links = []
    anchors = []
    names = []

    anchors = snippets


    for anchor in anchors:
        #print(type(anchor))
        links.append("https://1lib.in" + anchor.get("href"))
        names.append(anchor.contents[0])

    authors = soup.find_all(class_="color1")

    for i in range(0, len(authors)):
        authors[i] = authors[i].contents

    return names, authors, links

def onelib(name):
    name = name.split()

    url = "https://1lib.in/s/" + name[0]

    for i in range(1, len(name)):
        url = url + "%20" + name[i]

    print(url)

    res = requests.get(url)

    #print(type(res.text))
    #print(res.ok)

    soup = BeautifulSoup(res.content, 'html.parser')

    with open("output1.html", "w", encoding='utf-8') as file:
        file.write(str(soup))

    #print(soup)

    #print(soup.find("h3"))

    snippets = soup.find_all("a", {'style': 'text-decoration: underline;'})

    #print(snippets)

    links = []
    anchors = []
    names = []

    anchors = snippets


    for anchor in anchors:
        #print(type(anchor))
        links.append("https://1lib.in" + anchor.get("href"))
        names.append(anchor.contents[0])

    authors = soup.find_all(class_="color1")

    for i in range(0, len(authors)):
        authors[i] = authors[i].contents

    #print(authors)

    #print(type(links[0]))

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
    return names, authors, links

def allbooksworld(name):

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
    tempNames = []

    for snip in snippets:
        #print(snip)
        anchors.append(snip.find("a"))


    for anchor in anchors:
        #print(type(anchor))
        searchLinks.append(anchor.get("href"))
        tempNames.append(anchor.contents[0])

    """options = webdriver.ChromeOptions()
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--incognito')
    options.add_argument('--headless')
    driver = webdriver.Chrome(ChromeDriverManager().install(), chrome_options=options)"""

    #searchLinks = [searchLinks[4]]

    for k in range(0, len(searchLinks)):
        link = searchLinks[k]
        res = requests.get(link)
        soup = BeautifulSoup(res.content, 'html.parser')
        #print(soup)
        oneupload = soup.find_all("input", {"name":"downloadfile"})
        for i in range(0, len(oneupload)):
            oneupload[i] = oneupload[i]["value"]

            tempName = tempNames[k]

            if (oneupload[i].find("epub") != -1 or oneupload[i].find("ePub")  != -1) and tempName.find("ePub") == -1:
                # print("pdf to epub")
                # print(tempName)
                tempName = tempName.replace("PDF", "ePub")
            if oneupload[i].find("pdf") != -1 and tempName.find("PDF") == -1:
                # print("epub to pdf")
                # print(tempName)
                tempName = tempName.replace("ePub", "PDF")

            links.append(oneupload[i])
            names.append(tempName)
        #print(oneupload)

        #Doesnt work because of time between downloads on hoster
        """for dl in oneupload:

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

            links.append(dlLink)"""

    return names, links


def search_for_book(book, result_num):

    ABWnames, ABWlinks = allbooksworld(book)

    onelibNames, onelibAuthors, onelibLinks = onelib_sel(book) #Heroku
    #onelibNames, onelibAuthors, onelibLinks = onelib(book) #Local

    results = []

    one = 0;
    two =0;

    if result_num % 2 == 0:
        one = int(result_num / 2);
        two = int(result_num / 2);
    else:
        one = int(math.ceil(result_num/2));
        two = int(math.floor(result_num/2));

    if one > len(onelibNames):
        one = len(onelibNames)
        two = 10 - one;
    if two > len(ABWnames):
        two = len(ABWnames)

    # print(one, two)

    for i in range(0, one):
        # print("onelib")

        if (len(onelibAuthors[i]) != 0):
            results.append(onelibNames[i] + " (" + str(onelibAuthors[i][0]) + ")" + "\n" + onelibLinks[i])
        else:
            results.append(onelibNames[i] + "\n" + onelibLinks[i])

    for i in range(0, two):

        # print("ABW")

        results.append(ABWnames[i] + "\n" + ABWlinks[i])

    return results;

# book = input("Book: ");
# num = int(input("Num: "))
# print(search_for_book(book, num))

if __name__ == "__main__":
    results = search_for_book(sys.argv[1], int(sys.argv[2])) #Production
    #results = search_for_book(input("Book: "), int(input("Num: "))) #Testing
    print("starting")

    for result in results:
        print(result)
    
    print("finished")