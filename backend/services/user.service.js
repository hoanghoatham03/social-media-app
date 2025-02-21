import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import redisClient from "../utils/redisConfig.js";
import dotenv from "dotenv";

dotenv.config();

// Register a new user
export const registerService = async (username, email, password) => {
  try {
    //check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("User already exists");
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Login a user
export const loginService = async (email, password) => {
  try {
    //check if all fields are provided
    if (!email || !password) {
      throw new Error("All fields are required");
    }

    //check if user exists
    const userExists = await User.findOne({ email });
    if (!userExists) {
      throw new Error("User does not exist");
    }

    //check if password is valid
    const validPassword = await bcrypt.compare(password, userExists.password);
    if (!validPassword) {
      throw new Error("Invalid password");
    }

    //generate a JWT access token
    const accessToken = jwt.sign(
      { userId: userExists._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    //generate a JWT refresh token
    const refreshToken = jwt.sign(
      { userId: userExists._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    //save the refresh token in redis
    await redisClient.set(
      `refreshToken:${userExists._id}`,
      refreshToken,
      "EX",
      process.env.REDIS_REFRESH_EXPIRES_IN * 24 * 60 * 60
    );

    //get user info without password
    const { password: userPassword, ...userInfo } = userExists._doc;

    //return user info and access token
    return { userInfo, accessToken, refreshToken };
  } catch (error) {
    throw new Error(error.message);
  }
};

//refresh the access token
export const refreshAccessTokenService = async (refreshToken) => {
  try {
    //check if refresh token is valid
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (!decoded) {
      throw new Error("Invalid refresh token");
    }

    //check if refresh token is in redis
    const refreshTokenExists = await redisClient.get(
      `refreshToken:${decoded.userId}`
    );
    if (!refreshTokenExists || refreshTokenExists !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    //generate a new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return accessToken;
  } catch (error) {
    console.log("error", error);
    throw new Error(error.message);
  }
};

//logout the user
export const logoutService = async (userId) => {
  try {
    await redisClient.del(`refreshToken:${userId}`);
  } catch (error) {
    throw new Error(error);
  }
};

//get the user
export const getUserService = async (userId) => {
  try {
    const user = await User.findById(userId).populate({
      path: "posts",
      createdAt: -1,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const { password, ...userInfo } = user._doc;

    return userInfo;
  } catch (error) {
    throw new Error(error);
  }
};

//update the user profile
export const updateUserService = async (userId, req) => {
  try {
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    //upload the profile picture to cloudinary
    if (profilePicture) {
      const fileUri = await getDataUri(profilePicture);

      cloudResponse = await cloudinary.uploader.upload(fileUri, {
        resource_type: "auto",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (cloudResponse) user.profilePicture = {
      public_id: cloudResponse.public_id,
      url: cloudResponse.url,
    };

    const updatedUser = await user.save();
    const { password, ...userInfo } = updatedUser._doc;
    return userInfo;
  } catch (error) {
    throw new Error(error.message);
  }
};

//get suggestUser
export const getSuggestUserService = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    //get suggest users
    const suggestUser = user.following.length
      ? await User.aggregate([
          { $match: { _id: { $nin: [...user.following, userId] } } },
          { $sample: { size: 5 } },
          { $project: { password: 0 } },
        ])
      : await User.aggregate([
          { $match: { _id: { $ne: userId } } },
          { $sample: { size: 5 } },
          { $project: { password: 0 } },
        ]);
    return suggestUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

//follow a user
export const followUserService = async (userId, followId) => {
  try {
    if (userId === followId) {
      throw new Error("You cannot follow yourself");
    }

    const user = await User.findById(userId);
    const followUser = await User.findById(followId);

    if (!user || !followUser) {
      throw new Error("User not found");
    }

    //check if user is already following the followUser
    if (user.following.includes(followId)) {
      await user.updateOne({ $pull: { following: followId } });
      await followUser.updateOne({ $pull: { followers: userId } });

      return "User unfollowed successfully";
    }

    //if not, follow the user
    await user.updateOne({ $push: { following: followId } });
    await followUser.updateOne({ $push: { followers: userId } });

    return "User followed successfully";
  } catch (error) {
    throw new Error(error.message);
  }
};
