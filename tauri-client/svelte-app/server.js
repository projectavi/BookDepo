const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const path = require('path');

app.use(cors());

app.get("/search", (req, res) => {
    console.log(`Searching for books: ${req.query.data}`);
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