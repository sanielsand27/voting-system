const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const excelUpload = require("../middleware/excelUpload");


const {
  results,
  candidateVoters,
  getStats,
  getVoters,
  createVoter,
  deleteVoter,
  resetPassword,
  chartData,
  positionResults,
  importVoters
} = require("../controllers/adminController");


router.post(
  "/voters/import",
  authMiddleware,
  adminMiddleware,
  excelUpload.single("file"),
  importVoters
);


router.get(
  "/position-results",
  authMiddleware,
  adminMiddleware,
  positionResults
);



router.get(
  "/charts",
  authMiddleware,
  adminMiddleware,
  chartData
);




router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  getStats
);

router.get(
  "/results",
  authMiddleware,
  adminMiddleware,
  results
);

router.get(
  "/candidate/:id/voters",
  authMiddleware,
  adminMiddleware,
  candidateVoters
);


router.get(
  "/voters",
  authMiddleware,
  adminMiddleware,
  getVoters
);

router.post(
  "/voters",
  authMiddleware,
  adminMiddleware,
  createVoter
);

router.delete(
  "/voters/:id",
  authMiddleware,
  adminMiddleware,
  deleteVoter
);

router.put(
  "/voters/:id/password",
  authMiddleware,
  adminMiddleware,
  resetPassword
);


module.exports = router;
