import "dotenv/config";
import connectDB from "./src/config/db.js";
import { app } from "./src/app.js";
import { validateEnv } from "./src/config/validateEnv.js";
validateEnv();

connectDB()
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!! ", err);
    process.exitCode = 1;
  });
