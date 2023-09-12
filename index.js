const express = require("express");
 const { engine } = require('express-handlebars');
const cors = require("cors");
const routes = require("./routes");
const ConnectDb = require("./dbConnect");
const app = express();
require("dotenv").config({ path: `${__dirname}/.env` });

app.use(express.json());

// Configure handlebars engine
app.engine('handlebars', engine({ extname: '.hbs', defaultLayout: "main"}));
app.set('view engine', 'handlebars');

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

ConnectDb();
app.use(cors({ origin: "*" }));

app.use("/", routes);
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});