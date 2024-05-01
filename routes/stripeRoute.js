const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const authMiddleware = require("../middleware/authMiddleware");
const stripeController = require("../controllers/stripeController");


router.post(
    "/connect-account",
    authMiddleware.isAdminVerifier,
  
    stripeController.connectAccount
  );
router.get('/get-account',
authMiddleware.isAdminVerifier,
stripeController.getAccountInfo
)
router.post('/add-external-account',
authMiddleware.isAdminVerifier,
stripeController.addExternalAccount
)
router.get('/view-balance',
authMiddleware.isAdminVerifier,
stripeController.ViewBalance
)
router.post('/verify-account',
authMiddleware.isAdminVerifier,
stripeController.verifyAccount
)
router.post('/create-session',
authMiddleware.isAdminVerifier,
stripeController.createSession
)
router.get('/connected-account-exists',
authMiddleware.isAdminVerifier,
stripeController.ConectectedAccountExists
)
module.exports = router;
