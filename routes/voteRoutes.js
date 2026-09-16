const router = require("express").Router();

const auth = require("../middleware/authMiddleware");

const {
  vote,
  myVotes,
  results,
  submitVotes,
  voteSummary,
} = require("../controllers/voteController");



router.post("/", auth, vote);

router.post(
  "/submit",
  auth,
  submitVotes
);

router.get(
  "/my-votes",
  auth,
  myVotes
);

router.get(
  "/results",
  results
);


router.get(
  "/summary",
  auth,
  voteSummary
);



module.exports = router;
