function requests(app) {
    console.log(`Web server started on port: ${process.env.PORT}!`);

    app.get("/", homePage);
}

function homePage(req, res) {
    res.send("Hello World!");
}

module.exports = requests;