from flask import Flask, send_from_directory;
import random;

from main import search_for_book

app = Flask(__name__);

# TODO Route to the main Svelte page
@app.route("/")
def base():
    return send_from_directory("svelte-client/public", "index.html");

# TODO Route to the static compiled files
@app.route("/<path:path>")
def home(path):
    return send_from_directory("svelte-client/public", path)

@app.route("/search")
def search():
    return str(search_for_book("the way of kings", 5))

if __name__ == '__main__':
    app.run(debug=True);