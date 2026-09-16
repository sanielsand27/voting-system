const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

const {
  getCandidates,
  getCandidatesByPosition,
  createCandidate,
  deleteCandidate,
} = require("../controllers/candidateController");

router.get("/", getCandidates);

router.get(
  "/position/:id",
  getCandidatesByPosition
);

router.post(
  "/",
  auth,
  admin,
  upload.single("photo"),
  createCandidate
);

router.delete(
  "/:id",
  auth,
  admin,
  deleteCandidate
);

module.exports = router;
