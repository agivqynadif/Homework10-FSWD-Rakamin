const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const path = require("path");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/images", express.static("images"));
app.use("/movies/images/", express.static(path.join(__dirname, "images")));
require("./src/routes/routes.js")(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
