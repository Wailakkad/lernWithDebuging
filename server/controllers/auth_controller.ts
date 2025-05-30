import { Request, Response } from 'express';
import UserModel from '../database/models/User'; // Adjust the path as needed
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import jwt from "jsonwebtoken"; // Import JWT for token generation

interface RegisterUserRequest {
    username: string;
    email: string;
    password: string; // Changed from passwordHash to password
    developerType: string;
    experienceLevel: string;
  }
interface LoginUserRequest {
    email: string;
    password: string;

}


export const Login = async (req: Request<{}, {}, LoginUserRequest>, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body; // Changed from passwordHash to password

        // Validate required fields
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return;
        }

        // Find user and explicitly include passwordHash
        const existingUser = await UserModel.findOne({ email }).select('+passwordHash');
        
        if (!existingUser) {
            res.status(401).json({ message: 'Invalid credentials.' }); // Generic message
            return;
        }

        // Compare plain password with stored hash
        const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash);
        
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        // Create token payload (exclude sensitive data)
        const tokenPayload = {
            id: existingUser._id,
            email: existingUser.email,
            developerType: existingUser.developerType,
            experienceLevel: existingUser.experienceLevel
        };

        // Generate token
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });

        // Return response without password hash
        const userResponse = {
            _id: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            developerType: existingUser.developerType,
            experienceLevel: existingUser.experienceLevel
        };

        res.status(200).json({ 
            message: 'Login successful.', 
            user: userResponse 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};



export const Register = async (req: Request<{}, {}, RegisterUserRequest>, res: Response): Promise<void> => {
    try {
        const { username, email, password, developerType, experienceLevel } = req.body;

        // Validate required fields
        if (!username || !email || !password || !developerType || !experienceLevel) {
             res.status(400).json({ message: 'All fields are required. waylii' });
            return;
        }

        // Check if user exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
             res.status(400).json({ message: 'User already exists. wayliii' });
             return;
        }

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const newUser = new UserModel({
            username,
            email,
            passwordHash,
            developerType,
            experienceLevel
        });

        const savedUser = await newUser.save();

        if (!savedUser) {
            res.status(500).json({ message: 'Failed to create user.' });
            return;
        }

        if (savedUser) {
            res.status(201).json({ message: 'User created successfully.', user: savedUser });
            return;
        }

      
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error.' });
        return;
    }
};