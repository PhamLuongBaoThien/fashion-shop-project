const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
dotenv.config();

const app = express();
const port = process.env.PORT;


app.use(cors()); // tránh truy cập vào API từ domain khác
app.use(bodyParser.json()); // luôn luôn đứng trước các route
app.use(cookieParser()); // luôn luôn đứng trước các route

routes(app);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
