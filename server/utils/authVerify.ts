import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        developerType: string;
        experienceLevel: string;
    };
}

export const authVerify = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies.token;
    console.log('Token from cookies:', token);
    
    if (!token) {
        console.log('No token found');
        res.status(401).json({ message: "Unauthorized - No token" });
        return; // Just return without sending the response
    }

    try {
        const secret = process.env.JWT_SECRET || "your_jwt_secret";
        const decoded = jwt.verify(token, secret) as { 
            id: string; 
            email: string; 
            developerType: string; 
            experienceLevel: string 
        };
        
        req.user = decoded;
        next();
    } catch(err) {
        console.error("JWT Verification Error:", err);
        res.status(401).json({ message: "Invalid token" });
        return; // Just return without sending the response
    }
}