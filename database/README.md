# Database Setup Guide

## Supabase Configuration

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Note down your project URL and API keys

### Step 2: Run Database Schema
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the SQL script

### Step 3: Configure Row Level Security (RLS)
The schema includes RLS policies to ensure data isolation between shops. Each shop can only access their own data.

### Step 4: Optional - Add Seed Data
For development/testing only, you can run `seed.sql` to add sample shop data.

## Database Structure

### Tables

#### 1. shops
Main table storing shop information for multi-tenant architecture.
- `shop_id` - Unique identifier (UUID)
- `shop_name` - Name of the shop
- `shop_owner_name` - Owner's name
- `shop_number` - Contact number
- `shop_address` - Shop address
- `shop_gstin` - Optional GST number (15 characters)
- `shop_userid` - Unique login ID
- `shop_passcode_hash` - Bcrypt hashed passcode
- `is_active` - Shop status
- `created_at`, `updated_at` - Timestamps

#### 2. shop_sessions
Tracks active login sessions with JWT tokens.
- `session_id` - Unique session identifier
- `shop_id` - Foreign key to shops table
- `session_token` - JWT token for authentication
- `ip_address` - Login IP address
- `user_agent` - Browser/device information
- `expires_at` - Session expiry timestamp

#### 3. audit_logs
Audit trail for all shop actions.
- `log_id` - Unique log identifier
- `shop_id` - Foreign key to shops table
- `action_type` - Type of action performed
- `action_details` - JSON details of the action
- `ip_address` - IP address of action
- `created_at` - Action timestamp

## Security Features

1. **Row Level Security (RLS)**: Ensures shops can only access their own data
2. **Password Hashing**: Passcodes are hashed using bcrypt
3. **Session Management**: JWT-based authentication with expiry
4. **Audit Logging**: All important actions are logged
5. **Data Validation**: Constraints ensure data integrity

## GSTIN Format
If provided, GSTIN must follow the format:
- 2 digits (State code)
- 5 letters (PAN)
- 4 digits
- 1 letter
- 1 alphanumeric
- Letter 'Z'
- 1 alphanumeric

Example: `27AABCU9603R1ZM`

## Maintenance

### Clean Expired Sessions
Run this periodically (can be set up as a cron job):
```sql
SELECT clean_expired_sessions();
```

### Backup
Regular backups are automatically handled by Supabase, but you can also:
1. Export data from Supabase dashboard
2. Use pg_dump for manual backups
