require("dotenv").config();

// request body-parser
const bodyParser = require("body-parser");

// mongoose require and connection
let mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// require url schema
let UrlModel = require("./models/url");

const express = require("express");
const cors = require("cors");
const app = express();

// use body-parser
app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// get
app.route("/api/shorturl/:id").get((req, res) => {
  // Do a lookup using the :id param
  UrlModel.findOne({ urlId: req.params.id })
    .select("url")
    .exec()
    .then((foundUrl) => {
      res.redirect(foundUrl.url);
    });
});

// post
app.route("/api/shorturl").post((req, res) => {
  // Lookup value on database
  UrlModel.findOne({ url: req.body.url })
    .select("urlId")
    .exec()
    .then((findResult) => {
      // If does not exists
      if (findResult === null) {
        const urlRegex =
          /^(https:\/\/|http:\/\/)([a-zA-Z0-9]+)(.[a-zA-Z0-9]+)+/;
        // If is valid url
        if (urlRegex.test(req.body.url)) {
          // Get the latest urlId using max(urlId)
          UrlModel.find({ urlId: { $gte: 1 } })
            .sort({ urlId: -1 })
            .limit(1)
            .select("urlId")
            .exec()
            .then((maxUrlId) => {
              // Insert document on DB
              UrlModel.create({
                url: req.body.url,
                // Latest urlId + 1
                urlId: maxUrlId[0].urlId + 1,
              }).then((newUrl) =>
                // Return json with the new url created and its shortned urlId
                res.json({ original_url: newUrl.url, short_url: newUrl.urlId })
              );
            });
        } else {
          // If not valid url
          res.json({ error: "invalid url" });
        }
      } else {
        // If already exists
        res.json({ original_url: req.body.url, short_url: findResult.urlId });
      }
    });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
