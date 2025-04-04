import dotenv from 'dotenv';
dotenv.config(); // This loads the .env file
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './database/connection/db';
import router from './route/ai_route';
import authRouter from './route/authRoute/authRouter';
import actionsRouter from './route/ActionsRoute/Actions';

const port = 3001;
const app = express();
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', router);
app.use('/api/auth', authRouter);
app.use('/api/actions', actionsRouter);


connectDB();
app.listen((port), ()=>{
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}`);
})
