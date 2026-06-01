const express = require("express");
const {
  postShowtime,
  getShowtimes,
  deleteShowtime,
  updateShowtime // 🟢 NAYA ADD KIYA: Update function import kiya
} = require("../controllers/showtime.controller");

const router = express.Router();

router.post("/showtime", postShowtime);
router.get("/showtime", getShowtimes);
router.delete("/showtime/:id", deleteShowtime); 
// 🟢 NAYA ADD KIYA: Update (Edit) karne ka rasta (route)
router.put("/showtime/:id", updateShowtime); 

module.exports = router;