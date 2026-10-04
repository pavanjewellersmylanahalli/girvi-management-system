const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

/**
 * Register a new shop
 */
const registerShop = async (req, res) => {
  try {
    const {
      shop_name,
      shop_owner_name,
      shop_number,
      shop_address,
      shop_gstin,
      shop_userid,
      shop_passcode
    } = req.body;

    // Check if shop_userid already exists
    const { data: existingShop } = await supabase
      .from('shops')
      .select('shop_userid')
      .eq('shop_userid', shop_userid)
      .single();

    if (existingShop) {
      return res.status(400).json({
        success: false,
        error: 'Shop User ID already exists. Please choose a different User ID.'
      });
    }

    // Hash the passcode
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const shop_passcode_hash = await bcrypt.hash(shop_passcode, saltRounds);

    // Insert new shop
    const { data: newShop, error } = await supabase
      .from('shops')
      .insert([{
        shop_name,
        shop_owner_name,
        shop_number,
        shop_address,
        shop_gstin: shop_gstin || null,
        shop_userid,
        shop_passcode_hash
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to register shop. Please try again.'
      });
    }

    // Log the registration in audit logs
    await supabase
      .from('audit_logs')
      .insert([{
        shop_id: newShop.shop_id,
        action_type: 'SHOP_REGISTRATION',
        action_details: {
          shop_name,
          registered_by: shop_owner_name
        },
        ip_address: req.ip
      }]);

    // Return success without sensitive data
    res.status(201).json({
      success: true,
      message: 'Shop registered successfully',
      data: {
        shop_id: newShop.shop_id,
        shop_name: newShop.shop_name,
        shop_userid: newShop.shop_userid,
        created_at: newShop.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during registration'
    });
  }
};

/**
 * Login shop with userid and passcode
 */
const loginShop = async (req, res) => {
  try {
    const { shop_userid, shop_passcode } = req.body;

    // Find shop by userid
    const { data: shop, error } = await supabase
      .from('shops')
      .select('*')
      .eq('shop_userid', shop_userid)
      .eq('is_active', true)
      .single();

    if (error || !shop) {
      return res.status(401).json({
        success: false,
        error: 'Invalid User ID or Passcode'
      });
    }

    // Verify passcode
    const isValidPasscode = await bcrypt.compare(shop_passcode, shop.shop_passcode_hash);

    if (!isValidPasscode) {
      return res.status(401).json({
        success: false,
        error: 'Invalid User ID or Passcode'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        shop_id: shop.shop_id,
        shop_userid: shop.shop_userid,
        shop_name: shop.shop_name
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await supabase
      .from('shop_sessions')
      .insert([{
        shop_id: shop.shop_id,
        session_token: token,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        expires_at: expiresAt.toISOString()
      }]);

    // Log the login
    await supabase
      .from('audit_logs')
      .insert([{
        shop_id: shop.shop_id,
        action_type: 'LOGIN',
        action_details: {
          login_time: new Date().toISOString()
        },
        ip_address: req.ip
      }]);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        shop: {
          shop_id: shop.shop_id,
          shop_name: shop.shop_name,
          shop_owner_name: shop.shop_owner_name,
          shop_userid: shop.shop_userid
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    });
  }
};

/**
 * Logout shop
 */
const logoutShop = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      // Delete session
      await supabase
        .from('shop_sessions')
        .delete()
        .eq('session_token', token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during logout'
    });
  }
};

/**
 * Get shop profile (placeholder - requires auth middleware)
 */
const getShopProfile = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Authentication middleware not yet implemented'
  });
};

/**
 * Update shop profile (placeholder - requires auth middleware)
 */
const updateShopProfile = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Authentication middleware not yet implemented'
  });
};

module.exports = {
  registerShop,
  loginShop,
  logoutShop,
  getShopProfile,
  updateShopProfile
};
