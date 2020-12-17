from selenium import webdriver
from bs4 import BeautifulSoup
import pandas as pd
from lxml import html
from webdriver_manager.chrome import ChromeDriverManager
import requests


driver = webdriver.Chrome(ChromeDriverManager().install())

#driver = webdriver.Chrome("/usr/lib/chromium-browser/chromedriver")

def get_book_by_name_pdfdrive(name_searched):
    name_searched = name_searched.split(" ")
    print(name_searched)
    book_names=[] #List to store name of the book
    links=[] #List to store the link of the book
    dl_links=[]
    formatted_search = name_searched[0]
    if len(name_searched) != 1:
        for i in range(1, len(name_searched)):
            formatted_search+= "+" + name_searched[i]
    pdfdrive_search = "https://www.pdfdrive.com/search?q=" + formatted_search + "&pagecount=&pubyear=&searchin=&em="
    page = requests.get(pdfdrive_search)
    
    html = page.text
    
    print(len(html))
    
    sub = '<div class="files-new">'

    position = html.find(sub) - 1
    
    html = html[position:len(html)]
    
    print(len(html))
    
    sub = "<a href="
    
    for i in range(0,10):
    
        position = html.find(sub) + len(sub)
        
        print(position)
        
        link_add = html[position]
        
        x = 1
        
        while html[position+x] != '"':
            link_add += html[position+x]
            x += 1
        
        link_add = link_add.replace('"', '')
        
        final_link = "https://www.pdfdrive.com" + link_add
    
        print(final_link) 
        
        links.append(final_link)
        
        html = html[position+x:len(html)]
    
    links = list(set(list(links)))
    
    print(links)
    
    for book in links:
        page = requests.get(book)
        html = page.text
        sub_title = '<meta property="og:title" content='
        position_title = html.find(sub_title) + len(sub_title)
        title = html[position_title]
        x = 1
        while html[position_title+x] != '"':
            title += html[position_title+x]
            x += 1
        title = title.replace('"', '')
        book_names.append(title)
        
        sub_dl = '<span id="download-button"><a id="download-button-link" class="btn btn-primary btn-responsive" href='
        position_dl = html.find(sub_dl) + len(sub_dl)
        dl = html[position_dl]
        x = 1
        while html[position_dl+x] != '"':
            dl += html[position_dl+x]
            x += 1
        dl = dl.replace('"', '')
        dl = "https://www.pdfdrive.com" + dl
        dl_links.append(dl)
    
    print(book_names)
    print(dl_links)
        
        
        
        
        





    

    
get_book_by_name_pdfdrive("six easy piece by richard feynman")

"""
class ="file-right"

get the url

<h2> has the title
"""