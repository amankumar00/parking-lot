const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  vehicleID: {
    type: String,
    required: true,
    unique: true,
  },
  vehicleType: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
