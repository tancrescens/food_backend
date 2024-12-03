const express = require("express");
const cors = require("cors");

let app = express();
app.use(cors());


// ROUTES here
// ROUTE: Default
app.get("/", function (req, res) {
    res.send("Hello Food Review")
})


// Server starting on port 3000
app.listen("3000", function () {
    console.log("Server started on port 3000");
})