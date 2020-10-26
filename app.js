const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 5000;

//var logger = require('morgan');
// configure middleware
app.set("port", process.env.port || port); // set express to use this port
app.set("views", __dirname + "/views"); // set express to look in this folder to render our view
app.set("view engine", "ejs"); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(__dirname + "public")); // configure express to use public folder

//app.use(logger);

require("./routes")(app);
// set the app to listen on the port
app.listen(port, () => {
  //console.log(`Server running on port: ${port}`);
});
