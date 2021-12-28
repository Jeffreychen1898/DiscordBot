require("dotenv").config()

const express = require("express")
const app = express()

app.listen(process.env.PORT, () => {
    console.log("Web server started on port: " + process.env.PORT)
});

app.get("/", (req, res) => {
    res.send("Hello World!")
})