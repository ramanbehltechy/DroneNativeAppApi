const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const ConnectDb = require("./dbConnect");
const app = express();
require("dotenv").config({ path: `${__dirname}/.env` });

app.use(express.json());

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