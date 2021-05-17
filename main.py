import requests
from bs4 import BeautifulSoup
import re
from selenium import webdriver
import time
from webdriver_manager.chrome import ChromeDriverManager

def onelib(name):
    print(2)
    name = name.split()

    url = "https://1lib.in/s/" + name[0]

    for i in range(1, len(name)):
        url = url + "%20" + name[i]

    #print(url)

    res = requests.get(url)

    #print(type(res.text))
    #print(res.status_code)

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

    print(3)

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

    print("4")

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

    print(5)

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
        print(k)
        link = searchLinks[k]
        res = requests.get(link)
        soup = BeautifulSoup(res.content, 'html.parser')
        #print(soup)
        oneupload = soup.find_all("input", {"name":"downloadfile"})
        for i in range(0, len(oneupload)):
            oneupload[i] = oneupload[i]["value"]

            tempName = tempNames[k]

            if oneupload[i].find("epub") != -1 and tempName.find("ePub") == -1:
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

    print("1")

    onelibNames, onelibAuthors, onelibLinks = onelib(book)

    ABWnames, ABWlinks = allbooksworld(book)

    results = []

    for i in range(0, result_num-len(ABWlinks)):
        print("")
        print(onelibNames[i] + " (" + str(onelibAuthors[i][0]) + "): ")
        print(onelibLinks[i])

        results.append(onelibNames[i] + " (" + str(onelibAuthors[i][0]) + "): \n" +  onelibLinks[i])

    for i in range(0, len(ABWlinks)):
        print("")
        print(ABWnames[i])
        print(ABWlinks[i])

        results.append(ABWnames[i] + "\n" + ABWlinks[i])

    return results;