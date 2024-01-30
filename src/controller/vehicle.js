const Vehicle = require("../model/vehicle.js");
var ids = require("short-id");

const createVehicle = async (req, res) => {
  try {
    // let vehicle = new Vehicle();
    // vehicle.vehicleID = ids.generate();
    // vehicle.vehicleType = req.body.vehicleType;\
    // let vt =;
    var id = await ids.generate();
    console.log(id);
    const vehicle = await new Vehicle({
      vehicleID: id,
      vehicleType: req.query.vehicleType,
    });
    await vehicle.save();
    return res.status(201).json({
      message: " created successfully",
      vehicleID: Vehicle.vehicleID,
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  createVehicle,
};
