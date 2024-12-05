require("dotenv").config();
const express = require("express");
const cors = require("cors");

let app = express();
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;

// ROUTES here
// ROUTE: Default
app.get("/", function (req, res) {
    res.send("Hello Food Reviewers!")
})


// Server starting on port 3000
app.listen(PORT, function () {
    console.log("Server started on port " + PORT);
})