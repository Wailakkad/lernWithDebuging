import mongoose from "mongoose";



export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log("MongoDB connected successfully");

    }catch(err){
        console.error(err);
        throw new Error("Database connection failed");
    }
}