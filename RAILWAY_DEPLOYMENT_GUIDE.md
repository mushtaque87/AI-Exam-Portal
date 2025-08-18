# Railway Deployment Guide for AI-Exam-Portal

## Issues Fixed

### 1. Build Process Error

**Problem**: `react-scripts: not found` error during deployment
**Root Cause**: Railway wasn't properly installing client dependencies before building

**Solution**: Created `nixpacks.toml` configuration file to handle the build process correctly:

- Install root dependencies with `npm ci`
- Install client dependencies with `cd client && npm ci`
- Build React app with `cd client && npm run build`

### 2. Railway Configuration

**Problem**: No Railway-specific configuration
**Solution**: Created `railway.toml` with proper deployment settings:

- Uses Nixpacks builder
- Sets correct start command
- Configures health checks and restart policies

### 3. CORS Configuration

**Problem**: Hardcoded domain in CORS settings
**Solution**: Updated server.js to use environment variable or Railway wildcard domain

## Files Created/Modified

### New Files:

1. `railway.toml` - Railway deployment configuration
2. `nixpacks.toml` - Build process configuration
3. `RAILWAY_DEPLOYMENT_GUIDE.md` - This guide

### Modified Files:

1. `package.json` - Added Railway-specific scripts
2. `server.js` - Updated CORS configuration for Railway

## Deployment Steps

1. **Push Changes to GitHub**:

   ```bash
   git add .
   git commit -m "Fix Railway deployment configuration"
   git push origin main
   ```

2. **Railway Environment Variables**:
   Set these in your Railway project dashboard:

   - `NODE_ENV=production`
   - `DATABASE_URL` (your MySQL connection string)
   - `JWT_SECRET` (your JWT secret key)
   - `FRONTEND_URL` (optional, your Railway app URL)

3. **Redeploy**:
   Railway will automatically redeploy when you push to GitHub

## Build Process Flow

1. **Setup Phase**: Install Node.js and npm
2. **Install Phase**:
   - Install root dependencies (`npm ci`)
   - Install client dependencies (`cd client && npm ci`)
3. **Build Phase**: Build React app (`cd client && npm run build`)
4. **Start Phase**: Start Express server (`npm start`)

## Verification

After deployment, verify:

- [ ] App builds successfully without `react-scripts` error
- [ ] React app is served at root URL
- [ ] API endpoints work at `/api/*`
- [ ] Database connection is established
- [ ] Health check endpoint `/api/health` returns OK

## Troubleshooting

If deployment still fails:

1. Check Railway build logs for specific errors
2. Verify all environment variables are set
3. Ensure database is accessible from Railway
4. Check that all dependencies are listed in package.json files

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connection string updated
- [ ] CORS origins configured correctly
- [ ] Build process completes successfully
- [ ] Static files served correctly
- [ ] API routes accessible
