import app from '../src/app';
import connectDB from '../src/config/database';

export default async function handler(req: any, res: any) {
    // Connect to the database
    await connectDB();

    // Hand off the request to the Express application
    return app(req, res);
}