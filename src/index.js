const express = require("express");
const env = require("dotenv");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const lotRoutes = require("./route/parkingLot.js");
const vehicleRoutes = require("./route/vehicle.js");
app.use(bodyParser());
env.config();
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.ynbz1u8.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("database connected");
  });

app.listen(process.env.PORT, () => {
  console.log("server started on port " + process.env.PORT);
});

app.use("/api", lotRoutes);
app.use("/api", vehicleRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "success" });
});
