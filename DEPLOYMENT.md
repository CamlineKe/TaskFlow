# TaskFlow Deployment Configuration

## Environment Variables Setup

### Frontend (Client) - Vercel

For the frontend deployment on Vercel, you need to set the following environment variables:

#### Production Environment Variables:
- `NEXT_PUBLIC_API_URL`: `https://taskflowb.vercel.app/api`
  - This should point to your deployed backend API URL

#### How to set environment variables in Vercel:
1. Go to your Vercel dashboard
2. Select your frontend project (taskflow-woad-phi)
3. Go to Settings → Environment Variables
4. Add the environment variables listed above

### Backend (Server) - Vercel

For the backend deployment on Vercel, you need to set the following environment variables:

#### Required Environment Variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key for token generation
- `EMAIL_USER`: Your email address for sending verification emails
- `EMAIL_PASS`: Your email app password for authentication
- `NODE_ENV`: Set to `production` for production deployment

#### How to set environment variables in Vercel:
1. Go to your Vercel dashboard
2. Select your backend project (taskflowb)
3. Go to Settings → Environment Variables
4. Add the environment variables listed above

## CORS Configuration

The backend is configured to allow requests from:
- Production: `https://taskflow-woad-phi.vercel.app`
- Development: `http://localhost:3000`, `http://localhost:3001`, `http://localhost:3002`

## Deployment Steps

### 1. Deploy Backend First
- Deploy your backend to Vercel first
- Note down the deployed URL (e.g., https://taskflowb.vercel.app)

### 2. Configure Frontend Environment Variables
- Set `NEXT_PUBLIC_API_URL` to your backend URL + `/api`
- Example: `https://taskflowb.vercel.app/api`

### 3. Deploy Frontend
- Deploy your frontend to Vercel
- The frontend will now be able to communicate with your backend

## Troubleshooting CORS Issues

If you're still experiencing CORS issues after deployment:

1. Verify that `NEXT_PUBLIC_API_URL` is set correctly in your frontend Vercel environment
2. Check that your frontend domain is included in the backend's allowed origins
3. Ensure your backend is deployed and accessible
4. Check the browser console for specific error messages

## API Endpoints

- Authentication: `POST /api/auth/login`, `POST /api/auth/register`
- Projects: `GET/POST/PUT/DELETE /api/projects/*`
- Tasks: `GET/POST/PUT/DELETE /api/tasks/*`
- Columns: `GET/POST/PUT/DELETE /api/columns/*`
- Users: `GET/PUT /api/users/*`