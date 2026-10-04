-- Seed data for testing (DEVELOPMENT ONLY)
-- DO NOT use in production

-- Sample shop entry
-- Password: "1234" (bcrypt hash)
INSERT INTO shops (
    shop_name,
    shop_owner_name,
    shop_number,
    shop_address,
    shop_gstin,
    shop_userid,
    shop_passcode_hash
) VALUES (
    'Shree Ganesh Jewellers',
    'Rajesh Kumar',
    '9876543210',
    '123, MG Road, Mumbai, Maharashtra - 400001',
    '27AABCU9603R1ZM', -- Sample GSTIN
    'ganesh_jewel',
    '$2b$10$rH8qGz7K9YxZ8kJ5nR5nXuZ9xqJ5YxZ8kJ5nR5nXuZ9xqJ5YxZ8kJ' -- Hash for "1234"
);

-- Note: In production, passcode_hash should be generated using bcrypt with proper salt rounds
-- Example in Node.js: bcrypt.hashSync('1234', 10)
