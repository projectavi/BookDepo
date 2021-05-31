const express = require('express');
const serverless = require('serverless-http');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const path = require('path');
const fs = require('fs');
let query_results = []
let temp_results = []
let new_item = {title: "", link: ""};
let FLAG_done = false;

app.use(cors());

// app.handler = serverless(app);

function dictToObject(item, index) {
    console.log(item);
    if (item == "finished") {
        FLAG_done = true;
    }
    else {
        if ((index % 2) === 0) {
            new_item.title = item;
        }
        else {
            new_item.link = item;

            query_results.push(new_item);

            new_item = {title: "", link: ""};
        }
    //query_results.push(JSON.parse(item));
    }
}

app.get("/search", (req, res) => {
    let data = JSON.parse(req.query.term);
    //let num_results = req.query.num;
    console.log(data);
    //console.log(num_results)
    console.log("Searching for " + data.num + " links to download " + data.search);
    // Run the python script here and send the results, or webscrape in node

    let {PythonShell} = require('python-shell');

    query_results = [];

    PythonShell.run("./python-scripts/main.py", {args: [data.search, data.num]}, function(err, results) {
        if (err) throw err;
        //console.log("main.py executed.")
        results.forEach(dictToObject);

        //window.open(results[0], '_blank');

        console.log(results);

        res.send({
            success: true,
            data: query_results
        });
        
    });
})

app.use(express.static("public"));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

app.listen(port, () => {
    console.log(`Server is up at port ${port}`);
 });