const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
} = require("../controllers/positionController");

router.get("/", getPositions);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createPosition
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updatePosition
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deletePosition
);

module.exports = router;
