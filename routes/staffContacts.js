const express = require('express');
const router = express.Router();
const staffContactController = require('../controller/staffContactController');

router.get('/', staffContactController.getContacts);
router.post('/', staffContactController.createContact);
router.put('/:id', staffContactController.updateContact);
router.delete('/:id', staffContactController.deleteContact);

module.exports = router;
