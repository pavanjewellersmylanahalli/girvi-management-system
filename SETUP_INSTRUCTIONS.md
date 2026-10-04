# Girvi Management System - Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Vercel account (for frontend deployment)
- Render account (for backend deployment)

## Part 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in project details:
   - Name: girvi-management
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Wait for project to be created (takes ~2 minutes)

### 1.2 Setup Database Schema
1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql`
4. Paste and click "Run"
5. Verify tables are created in "Table Editor"

### 1.3 Get API Credentials
1. Go to Project Settings > API
2. Note down:
   - Project URL (SUPABASE_URL)
   - anon public key (SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

## Part 2: Backend Setup (Render)

### 2.1 Prepare Backend Code
```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables
Create `.env` file in backend folder:
```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secure-random-string-here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
ALLOWED_ORIGINS=http://localhost:3000
```

### 2.3 Test Locally
```bash
npm run dev
```
Should see: "🚀 Girvi Backend Server running on port 3001"

### 2.4 Deploy to Render
1. Push your code to GitHub
2. Go to https://render.com
3. Click "New +" > "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: girvi-backend
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
6. Add Environment Variables (from your .env file)
7. Click "Create Web Service"
8. Wait for deployment (takes ~5 minutes)
9. Note down your backend URL (e.g., https://girvi-backend.onrender.com)

## Part 3: Frontend Setup (Next.js + Vercel)

### 3.1 Create Next.js App
```bash
npx create-next-app@latest frontend
# Choose:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - App Router: Yes
```

### 3.2 Install Dependencies
```bash
cd frontend
npm install axios @tanstack/react-query
```

### 3.3 Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3.4 Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Follow prompts and update `NEXT_PUBLIC_API_URL` to your Render backend URL.

## Testing the Shop Registration

### Test Registration API
```bash
curl -X POST http://localhost:3001/api/shops/register \
  -H "Content-Type: application/json" \
  -d '{
    "shop_name": "Test Jewellers",
    "shop_owner_name": "John Doe",
    "shop_number": "9876543210",
    "shop_address": "123 Main St, City, State - 400001",
    "shop_gstin": "27AABCU9603R1ZM",
    "shop_userid": "test_shop",
    "shop_passcode": "1234"
  }'
```

### Test Login API
```bash
curl -X POST http://localhost:3001/api/shops/login \
  -H "Content-Type: application/json" \
  -d '{
    "shop_userid": "test_shop",
    "shop_passcode": "1234"
  }'
```

## Security Checklist

- [ ] Changed JWT_SECRET to a strong random string
- [ ] SUPABASE_SERVICE_ROLE_KEY is kept secret (not in frontend)
- [ ] CORS is configured with specific origins (not '*')
- [ ] HTTPS is enabled in production
- [ ] Row Level Security (RLS) is enabled in Supabase
- [ ] Rate limiting is configured
- [ ] Environment variables are set in Render/Vercel

## Next Steps

1. Create frontend pages for shop registration and login
2. Implement authentication middleware for protected routes
3. Add girvi/pledge entry management features
4. Implement customer management
5. Add payment tracking
6. Generate reports and receipts

## Troubleshooting

### Backend won't start
- Check if all environment variables are set
- Verify Supabase credentials are correct
- Check Node.js version (should be 18+)

### Database connection fails
- Verify SUPABASE_URL is correct
- Check if service role key is valid
- Ensure RLS policies allow service role access

### CORS errors
- Update ALLOWED_ORIGINS in backend .env
- Verify frontend is making requests to correct backend URL

## Support

For issues or questions:
1. Check database logs in Supabase dashboard
2. Check server logs in Render dashboard
3. Review API responses for error messages
