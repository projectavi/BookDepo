from selenium import webdriver
from bs4 import BeautifulSoup
import pandas as pd
from webdriver_manager.chrome import ChromeDriverManager
import requests


driver = webdriver.Chrome(ChromeDriverManager().install())

#driver = webdriver.Chrome("/usr/lib/chromium-browser/chromedriver")

def get_book_by_name(name_searched):
    name_searched = name_searched.split(" ")
    print(name_searched)
    book_names=[] #List to store name of the book
    links=[] #List to store the link of the book
    formatted_search = name_searched[0]
    if len(name_searched) != 1:
        for i in range(1, len(name_searched)):
            formatted_search+= "+" + name_searched[i]
    pdfdrive_search = "https://www.pdfdrive.com/search?q=" + formatted_search + "&pagecount=&pubyear=&searchin=&em="
    page = requests.get(pdfdrive_search)
    pprint()

    

    
get_book_by_name("godel escher bach")