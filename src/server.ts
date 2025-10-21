// /* eslint-disable */

// // Handle uncaught exception
// process.on("uncaughtException", (err: unknown) => {
//   console.log("Uncaught exception");

//   if (err instanceof Error) {
//     console.log(err);
//     console.log(err.name, err.message);
//   } else {
//     console.log(err);
//   }

//   process.exit(1);
// });

// import app from "./app";
// import dotenv from "dotenv";
// import mongoose from "mongoose";

// dotenv.config({ path: "./config.env", quiet: true });

// mongoose
//   .connect(process.env.DB_CONNECTION_STRING as string, {})
//   .then(() => {
//     console.log("Database connection successful");
//   })
//   .catch((err) => {
//     console.error("Database connection error:", err);
//   });

// if (require.main === module) {
//   const port = Number(process.env.PORT || 4000);
//   const server = app.listen(port, () => {
//     console.log(`Server is listening on port ${port}`);
//   });

//   // Handle unhandled rejections
//   process.on("unhandledRejection", (err: unknown) => {
//     console.log("Unhandled error rejections");

//     if (err instanceof Error) {
//       console.log(err);
//       console.log(err.name, err.message);
//     } else {
//       console.log(err);
//     }

//     server.close(() => {
//       process.exit(1);
//     });
//   });
// }

// // Export app for Vercel or testing
// export default app;

/* eslint-disable */
process.on("uncaughtException", (err: unknown) => {
  console.log("Uncaught exception");
  if (err instanceof Error) {
    console.log(err.name, err.message);
  }
  process.exit(1);
});

import app from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "./config.env", quiet: true });

// Cache the connection promise
let dbConnection: Promise<typeof mongoose> | null = null;

const connectDB = async () => {
  if (dbConnection) {
    return dbConnection;
  }

  dbConnection = mongoose.connect(process.env.DB_CONNECTION_STRING as string, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    await dbConnection;
    console.log("Database connection successful");
  } catch (err) {
    dbConnection = null; // Reset on error
    console.error("Database connection error:", err);
    throw err;
  }

  return dbConnection;
};

// For Vercel: ensure DB is connected before handling requests
connectDB();

if (require.main === module) {
  const port = Number(process.env.PORT || 4000);
  const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });

  process.on("unhandledRejection", (err: unknown) => {
    console.log("Unhandled error rejections");
    if (err instanceof Error) {
      console.log(err.name, err.message);
    }
    server.close(() => {
      process.exit(1);
    });
  });
}

export default app;
export { connectDB };
