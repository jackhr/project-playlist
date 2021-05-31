var express = require('express');
var router = express.Router();
const usersCtrl = require('../controllers/users');

// GET /users
router.get('/', usersCtrl.index);
// GET /users/:id
router.get('/:id', usersCtrl.show);

module.exports = router;
