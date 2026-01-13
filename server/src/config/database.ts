import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectWithRetry = async (retries = MAX_RETRIES) => {
  try {
    const dbUri = process.env.DB_URI;
    if (!dbUri) {
      console.error('DB_URI is not defined. Server cannot start.');
      process.exit(1);
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 5000 });

  } catch (error) {
    console.error(`MongoDB connection error (attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error);
    
    if (retries > 0) {
      console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      // Wait for the specified delay before trying again
      await new Promise(res => setTimeout(res, RETRY_DELAY));
      // Recursively call the function with one less retry
      await connectWithRetry(retries - 1);
    } else {
      console.error('Max connection retries reached. Exiting.');
      process.exit(1);
    }
  }
};

const connectDB = async () => {
  // Listen for the 'open' event once to confirm the connection is fully ready.
  mongoose.connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
  });

  // Listen for any subsequent errors after the initial connection
  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error after initial connection:', err);
  });

  await connectWithRetry();
};

export default connectDB;
