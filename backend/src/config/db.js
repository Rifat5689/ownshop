import mongoose from "mongoose";

const connectDB = async () => {
  const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    autoIndex: process.env.NODE_ENV !== "production",
  });
  console.log(
    `\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`,
  );
};

export default connectDB;
