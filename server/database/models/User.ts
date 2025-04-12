import mongoose from "mongoose";

// Define developer types
const developerTypes = [
  "front-end",
  "back-end",
  "full-stack",
  "mobile",
  "game",
  "embedded",
  "data-science",
  "devops",
  "student",
  "other"
] as const;

// Define experience levels
const experienceLevels = [
  "beginner",
  "intermediate",
  "advanced",
  "professional"
] as const;

interface IUser extends mongoose.Document {
  username: string; // Optional: Add username if needed
  email: string;
  passwordHash: string;
  developerType: typeof developerTypes[number];
  experienceLevel: typeof experienceLevels[number];
  profileImage?: string; // New field for profile image
  thumbnailImage?: string; // New field for thumbnail image
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please use a valid email address",
      ],
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never returned in queries by default
    },
    developerType: {
      type: String,
      enum: developerTypes,
      required: [true, "Developer type is required"],
      default: "full-stack",
    },
    experienceLevel: {
      type: String,
      enum: experienceLevels,
      required: [true, "Experience level is required"],
      default: "beginner",
    },
    profileImage: {
      type: String,
      default: null, // Default value for profile image
    },
    thumbnailImage: {
      type: String,
      default: null, // Default value for thumbnail image
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const UserModel = mongoose.model<IUser>("Users", UserSchema);
export default UserModel;