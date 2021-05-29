const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const path = require('path');

app.use(cors());

app.get("/search", (req, res) => {
    let data = JSON.parse(req.query.term);
    //let num_results = req.query.num;
    console.log(data)
    //console.log(num_results)
    console.log("Searching for " + data.num + " links to download " + data.search);
    // Run the python script here and send the results, or webscrape in node
    res.send({
        success: true,
        data: []
    });
})

app.use(express.static("public"));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

app.listen(port, () => {
    console.log(`Server is up at port ${port}`);
 });