# Girvi Management System

A comprehensive pledge/pawn shop management system with multi-tenant architecture.

## Tech Stack

- **Frontend**: Next.js (Vercel deployment)
- **Backend**: Node.js/Express (Render deployment)
- **Database**: Supabase (PostgreSQL)

## Project Structure

```
├── frontend/          # Next.js application
├── backend/           # Express API server
└── database/          # Database schemas and migrations
```

## Features

- Multi-shop tenant system
- Secure shop registration and authentication
- 4-6 digit passcode login
- Data isolation per shop
- GSTIN support for GST compliance

## Getting Started

1. Set up Supabase project
2. Run database migrations
3. Configure environment variables
4. Deploy frontend to Vercel
5. Deploy backend to Render
