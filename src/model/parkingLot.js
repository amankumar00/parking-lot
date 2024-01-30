const mongoose = require("mongoose");

const spotSchema = new mongoose.Schema({
  spotID: {
    type: String,
    required: true,
    unique: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
    required: true,
  },
  allotedVehicle: {
    type: String,
    ref: "Vehicle",
  },
});

const parkingSpaceSchema = new mongoose.Schema({
  smallBay: {
    spots: [spotSchema],
  },
  mediumBay: {
    spots: [spotSchema],
  },
  largeBay: {
    spots: [spotSchema],
  },
  XlargeBay: {
    spots: [spotSchema],
  },
});

const floorSchema = new mongoose.Schema({
  floorNumber: {
    type: Number,
    required: true,
  },
  spaces: [parkingSpaceSchema],
});
const lotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  floors: [floorSchema],
});

module.exports = mongoose.model("Lot", lotSchema);
