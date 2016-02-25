/**
 * API ÇëÇóÂ·ÓÉ
 * @type {exports}
 */
var express = require('express');
var router = express.Router();
var file = require('./file/file');



router.use('/files', file);

module.exports = router;