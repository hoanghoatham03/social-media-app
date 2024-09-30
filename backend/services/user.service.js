import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const registerService = async (user) => {
  try {
    const { username, email, password } = user;

    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    throw new Error(error);
  }
};

export const loginService = async (user) => {
  try {
    const { email, password } = user;

    if (!email || !password) {
      throw new Error("All fields are required");
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
      throw new Error("User does not exist");
    }

    const validPassword = await bcrypt.compare(password, userExists.password);
    if (!validPassword) {
      throw new Error("Invalid password");
    }

    const accessToken = jwt.sign(
      { userId: userExists._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: userPassword, ...userInfo } = userExists._doc;
    

    return { ...userInfo, accessToken };
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserService = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const { password, ...userInfo } = user._doc;
    return userInfo;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateUserService = async (userId, req) => {
  try {
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (cloudResponse) user.profilePicture = cloudResponse.secure_url;

    const updatedUser = await user.save();
    const { password, ...userInfo } = updatedUser._doc;
    return userInfo;
  } catch (error) {
    throw new Error(error);
  }
};

export const getSuggestedUsersService = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const suggestedUsers = user.following.length
      ? await User.aggregate([
          { $match: { _id: { $nin: [...user.following, userId] } } },
          { $sample: { size: 5 } },
        ])
      : await User.aggregate([
          { $match: { _id: { $ne: userId } } },
          { $sample: { size: 5 } },
        ]);
    return suggestedUsers;
  } catch (error) {
    throw new Error(error);
  }
};

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

    if (user.following.includes(followId)) {
      await user.updateOne({ $pull: { following: followId } });
      await followUser.updateOne({ $pull: { followers: userId } });

      return "User unfollowed successfully";
    }

    await user.updateOne({ $push: { following: followId } });
    await followUser.updateOne({ $push: { followers: userId } });

    return "User followed successfully";
  } catch (error) {
    throw new Error(error);
  }
};
