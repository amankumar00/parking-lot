const ParkingLot = require("../model/parkingLot.js");
// const { ShortUniqueId } = require("short-unique-id");
const Vehicle = require("../model/vehicle.js");
// const uid = new ShortUniqueId({ length: 10 });
var ids = require("short-id");
// const vehicle = require("../model/vehicle.js");
const createLot = async (req, res) => {
  try {
    // Check if parking lot already exists
    const existingParkingLot = await ParkingLot.findOne({
      name: "ParkingLot",
    });
    if (existingParkingLot) {
      console.log("Parking lot already exists.");
      return existingParkingLot;
    }
    // Create new parking lot
    const parkingLot = await new ParkingLot({
      name: "ParkingLot",
      floors: await generateFloors(),
    });

    // Save parking lot to the database
    await parkingLot.save();
    // console.log("Parking lot created successfully.");

    return res.status(201).json({
      message: "Lot Created Succesfully",
    });
  } catch (error) {
    console.error("Error creating parking lot:", error);
    throw error;
  }

  // async function generateFloors() {
  //   const floors = [];
  //   // const types = ["small", "medium", "large", "xlarge"];
  //   // const spaceCount = 100;

  //   for (let i = 1; i <= 3; i++) {
  //     const floor = {
  //       floorNumber: i,
  //       spaces: [
  //         {
  //           smallBay: await allotSlots(),
  //           mediumBay: null,
  //           largeBay: null,
  //           XlargeBay: null,
  //         },
  //       ],
  //     };

  //     // for (let type of types) {
  //     //   for (let j = 0; j < spaceCount; j++) {
  //     //     floor.spaces.push({ type, occupied: false });
  //     //   }
  //     // }
  //     // for(let space of spaces){

  //     // }
  //     // floor.spaces = [

  //     // ];
  //     floors.push(floor);
  //   }

  //   return floors;
  // }

  function generateFloors() {
    const floors = [];
    for (let i = 1; i <= 3; i++) {
      const floor = {
        floorNumber: i,
        spaces: generateParkingSpaces(),
      };
      floors.push(floor);
    }
    return floors;
  }
  function generateParkingSpaces() {
    const parkingSpaces = [];
    // for (let j = 0; j < 4; j++) {
    const parkingSpace = {
      smallBay: { spots: generateSpots() },
      mediumBay: { spots: generateSpots() },
      largeBay: { spots: generateSpots() },
      XlargeBay: { spots: generateSpots() },
    };
    parkingSpaces.push(parkingSpace);
    // }
    return parkingSpaces;
  }
  function generateSpots() {
    const spots = [];
    for (let k = 1; k <= 100; k++) {
      spots.push({
        spotID: ids.generate(),
        isAvailable: true,
        allotedVehicle: null,
      });
    }
    return spots;
  }
};

const allotVehicle = async (req, res) => {
  try {
    let parkingLot = await ParkingLot.findOne({
      name: req.params.parkingLotName,
    });
    if (!parkingLot) {
      return res.status(404).json({
        message: "Parking Lot Not Found",
      });
    }
    console.log(req.body.vehicleID);
    let vehicle = await Vehicle.findOne({ vehicleID: req.body.vehicleID });
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle Not Found",
      });
    }
    if (isVehicleAllocated(vehicle.vehicleID) === true) {
      return res.status(401).json({
        error: "vehicle is already allocated",
      });
    }
    var fN;
    var bT;
    let availableSpace = null;
    for (let floor of parkingLot.floors) {
      for (let space of floor.spaces) {
        const bayTypes = ["smallBay", "mediumBay", "largeBay", "XlargeBay"];
        for (let bay of bayTypes) {
          fN = floor.floorNumber;
          bT = bay;
          const spots = space[bay].spots;
          if (vehicleFitsInBay(vehicle, bay) && isBayAvailable(spots)) {
            availableSpace = { floor, space, bay };
            break;
          }
        }
        if (availableSpace) break;
      }
      if (availableSpace) break;
    }
    if (availableSpace) {
      // Allot the vehicle to the available space
      // console.log(availableSpace);
      const spot = availableSpace.space[availableSpace.bay].spots.find(
        (spot) => spot.isAvailable
      );

      spot.isAvailable = false;
      spot.allotedVehicle = vehicle.vehicleID;
      // console.log(spot);
      await parkingLot.save();
      // console.log("yes");
      // console.log(
      //   `Vehicle ${vehicle.vehicleID} allotted to spot ${spot.spotID} in ${availableSpace.bayType} space.`
      // );
      // return true;

      return res.status(201).json({
        message: "successfully alloted Vehicle",
        vehicleId: vehicle.vehicleID,
        spotID: spot.spotID,
        floorNumber: fN,
        bayType: bT,
      });
    } else {
      console.log(`No available space found for vehicle ${vehicle.vehicleID}.`);
      return false;
    }
  } catch (e) {
    return res.status(401).json({
      message: e.message,
    });
  }
  function vehicleFitsInBay(vehicle, bayType) {
    // Determine if the vehicle fits in the given bay type
    switch (vehicle.vehicleType) {
      case "small":
        return true;
      case "medium":
        return bayType !== "smallBay";
      case "large":
        return bayType === "largeBay" || bayType === "XlargeBay";
      case "xlarge":
        return bayType === "XlargeBay";
      default:
        return false;
    }
  }

  function isBayAvailable(spots) {
    // Check if any spot in the bay is available
    return spots.some((spot) => spot.isAvailable);
  }
};

async function isVehicleAllocated(vehicleID) {
  try {
    // Find the parking lot
    const parkingLot = await ParkingLot.findOne({});

    // Iterate through floors and parking spaces to check if the vehicle is allocated
    for (let floor of parkingLot.floors) {
      for (let space of floor.spaces) {
        const bayTypes = ["smallBay", "mediumBay", "largeBay", "XlargeBay"];
        for (let bayType of bayTypes) {
          const spot = space[bayType].spots.find(
            (spot) => spot.allotedVehicle === vehicleID
          );
          if (spot) {
            console.log(
              `Vehicle ${vehicleID} is already allocated in spot ${spot.spotID} in ${bayType} space.`
            );
            return true;
          }
        }
      }
    }
    console.log(`Vehicle ${vehicleID} is not allocated.`);
    return false;
  } catch (error) {
    console.error("Error checking vehicle allocation:", error);
    throw error;
  }
}

const unallotVehicle = async (req, res) => {
  try {
    // Find the parking lot
    let parkingLot = await ParkingLot.findOne({
      name: req.params.parkingLotName,
    });
    if (!parkingLot) {
      return res.status(404).json({
        message: "Parking Lot Not Found",
      });
    }
    // console.log(req.body.vehicleID);
    let vehicle = await Vehicle.findOne({ vehicleID: req.body.vehicleID });
    console.log(req.body.vehicleID);
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle Not Found",
      });
    }

    // Iterate through floors and parking spaces to find the allocated spot
    for (let floor of parkingLot.floors) {
      for (let space of floor.spaces) {
        const bayTypes = ["smallBay", "mediumBay", "largeBay", "XlargeBay"];
        for (let bayType of bayTypes) {
          const floorNumber = floor.floorNumber;
          const spot = space[bayType].spots.find(
            (spot) => spot.allotedVehicle === vehicle.vehicleID
          );
          if (spot) {
            // Mark the spot as available and remove the vehicle allocation
            spot.isAvailable = true;
            spot.allotedVehicle = null;
            await parkingLot.save();
            return res.status(201).json({
              message: `Vehicle ${vehicle.vehicleID} unallocated from spot ${spot.spotID} in ${bayType} space.`,
              vehicleId: vehicle.vehicleID,
              spotID: spot.spotID,
              floorNumber: floorNumber,
              bayType: bayType,
            });
          }
        }
      }
    }
    res.status(404).json({
      error: `Vehicle ${vehicle.vehicleID} not found in any allocated spot.`,
    });
  } catch (error) {
    console.error("Error unallocating vehicle:", error);
    throw error;
  }
};

module.exports = {
  createLot,
  allotVehicle,
  unallotVehicle,
};
