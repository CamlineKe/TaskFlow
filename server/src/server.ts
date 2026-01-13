/**
 * This is the main entry point for the entire backend application.
 * Its primary responsibilities are:
 * 1. Loading environment variables.
 * 2. Establishing a connection to the database.
 * 3. Starting the Express server to listen for incoming HTTP requests.
 */

// Import the 'dotenv' library to load environment variables from a .env file
import dotenv from 'dotenv';
// Execute the config method to load the variables into process.env
dotenv.config();

// Import the configured Express application instance from the app.ts file
// This separates the app's configuration from the server's startup logic.
import app from './app';

// Import the database connection function from our config file.
import connectDB from './config/database';

// Determine the port to run the server on.
// It will try to use the PORT variable from the .env file first.
// If it's not defined, it will default to 5001.
const PORT = process.env.PORT || 5001;

/**
 * The main startup function for the server.
 * It's an async function because database connections are asynchronous.
 */
const startServer = async () => {
  try {
    // First, attempt to connect to the MongoDB database.
    // The 'await' keyword ensures that we wait for the connection to be
    // established before proceeding to start the server.
    await connectDB();

    // If the database connection is successful, start the Express server.
    // The app.listen() method binds the server to the specified port
    // and starts listening for incoming connections.
    app.listen(PORT, () => {
      // This callback function is executed once the server is successfully running.
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // If any error occurs during the startup process (e.g., database connection fails),
    // it will be caught here.
    console.error('Failed to start the server:', error);

    // Exit the Node.js process with a "failure" code (1).
    // This is important for deployment environments, as it signals that the
    // application failed to launch correctly.
    process.exit(1);
  }
};

// Execute the main startup function to launch the application.
startServer();
