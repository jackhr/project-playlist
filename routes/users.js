var express = require('express');
var router = express.Router();
const usersCtrl = require('../controllers/users');
const setPreviousUrl = require('../config/middleware');


// GET /users
router.get('/', setPreviousUrl, usersCtrl.index);
// GET /users/:id
router.get('/:id', setPreviousUrl, usersCtrl.show);

module.exports = router;
