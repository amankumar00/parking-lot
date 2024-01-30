const express = require("express");
const { createVehicle } = require("../controller/vehicle.js");
const router = express.Router();

router.post("/createVehicle", createVehicle);
// router.patch("/allotVehicle/:parkingLotName", allotVehicle);

module.exports = router;
