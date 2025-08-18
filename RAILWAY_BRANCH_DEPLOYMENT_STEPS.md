# Step-by-Step Guide: Deploy railway-deployment Branch on Railway

## Method 1: Using Railway Dashboard (Easiest)

### Step 1: Access Your Railway Project

1. Go to [railway.app](https://railway.app)
2. Login to your account
3. Click on your "AI-Exam-Portal" project

### Step 2: Change Source Branch

1. In your project dashboard, click on **"Settings"** (gear icon)
2. Scroll down to find **"Source"** or **"GitHub"** section
3. Look for **"Branch"** or **"Deploy Branch"** setting
4. Change from `main` to `railway-deployment`
5. Click **"Save"** or **"Update"**

### Step 3: Trigger Deployment

1. Go to **"Deployments"** tab
2. Click **"Deploy"** button to manually trigger a new deployment
3. Or wait for automatic deployment to start

### Step 4: Monitor Build Process

1. Watch the build logs in real-time
2. Verify that the build completes without the `react-scripts` error
3. Check that all phases complete successfully:
   - ✅ Setup Phase
   - ✅ Install Phase (both root and client dependencies)
   - ✅ Build Phase (React app builds)
   - ✅ Start Phase (Express server starts)

## Method 2: Using Railway CLI

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login and Link Project

```bash
# Login to Railway
railway login

# Navigate to your project directory
cd h:/AI

# Link to your Railway project
railway link
```

### Step 3: Deploy Specific Branch

```bash
# Deploy the railway-deployment branch
railway up --branch railway-deployment
```

## Method 3: GitHub Integration Settings

### Step 1: Railway GitHub Settings

1. In Railway dashboard, go to **Settings**
2. Find **"GitHub"** or **"Source"** section
3. Click **"Configure"** or **"Edit"**

### Step 2: Branch Configuration

1. Set **"Production Branch"** to `railway-deployment`
2. Enable **"Auto Deploy"** for this branch
3. Save the configuration

### Step 3: Verify Auto-Deploy

1. Any future pushes to `railway-deployment` branch will auto-deploy
2. Check deployment status in Railway dashboard

## Environment Variables (Required)

Before deployment, ensure these are set in Railway:

1. **In Railway Dashboard**:
   - Go to **"Variables"** tab
   - Add the following variables:

```
NODE_ENV=production
DATABASE_URL=mysql://username:password@host:port/database_name
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://your-app-name.railway.app
```

## Verification Checklist

After deployment, verify:

- [ ] Build logs show no `react-scripts` errors
- [ ] Application loads at your Railway URL
- [ ] Login page appears correctly
- [ ] API endpoints respond (check `/api/health`)
- [ ] Database connection works
- [ ] Admin login works with default credentials

## Default Login Credentials (After Deployment)

- **Email**: admin@examportal.com
- **Password**: admin123

## Troubleshooting

### If Build Still Fails:

1. Check Railway build logs for specific errors
2. Verify all environment variables are set correctly
3. Ensure database is accessible from Railway
4. Check that `nixpacks.toml` and `railway.toml` are in the root directory

### If App Doesn't Load:

1. Check if `NODE_ENV=production` is set
2. Verify the start command is correct
3. Check server logs for runtime errors
4. Ensure database connection string is correct

### Common Issues:

- **Database Connection**: Make sure DATABASE_URL is correctly formatted
- **CORS Errors**: Verify FRONTEND_URL matches your Railway domain
- **Build Timeout**: Large dependencies might need more time

## Success Indicators

✅ **Build Success**: No errors in build logs
✅ **Server Start**: "Server running on port" message appears
✅ **Database**: "Database connected successfully" message
✅ **Seeding**: Initial data seeding completes
✅ **Access**: Application loads in browser
