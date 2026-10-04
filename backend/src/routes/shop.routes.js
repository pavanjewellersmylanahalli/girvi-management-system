const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const { validateShopRegistration, validateShopLogin } = require('../middleware/validators');
const rateLimiter = require('../middleware/rateLimiter');

// Shop registration - create new shop
router.post('/register', rateLimiter.register, validateShopRegistration, shopController.registerShop);

// Shop login - authenticate with userid and passcode
router.post('/login', rateLimiter.login, validateShopLogin, shopController.loginShop);

// Shop logout
router.post('/logout', shopController.logoutShop);

// Get shop profile (requires authentication)
router.get('/profile', shopController.getShopProfile);

// Update shop details (requires authentication)
router.put('/profile', shopController.updateShopProfile);

module.exports = router;
