const express = require('express');
const { handleWebhook } = require('./../controllers/webhookController');
const { verifyFlwSignature } = require('./../utils/flwServices');

const router = express.Router();

// webhook route
router.post('/', verifyFlwSignature, handleWebhook);

module.exports = router;
