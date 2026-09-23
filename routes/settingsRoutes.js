// routes/settingsRoutes.js

const router =
  require("express").Router();

const {
  getElectionStatus,
  toggleElectionStatus,
} = require(
  "../controllers/settingsController"
);

const auth =
  require("../middleware/authMiddleware");

const admin =
  require("../middleware/adminMiddleware");

router.get(
  "/election-status",
  getElectionStatus
);

router.put(
  "/election-status",
  auth,
  admin,
  toggleElectionStatus
);

module.exports = router;
