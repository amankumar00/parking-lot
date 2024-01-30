const express = require("express");
const {
  createLot,
  allotVehicle,
  unallotVehicle,
} = require("../controller/parkingLot.js");
const router = express.Router();

router.post("/createLot", createLot);
router.patch("/allotVehicle/:parkingLotName", allotVehicle);
router.patch("/unallotVehicle/:parkingLotName", unallotVehicle);

module.exports = router;
