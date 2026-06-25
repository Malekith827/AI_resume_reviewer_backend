import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit'

dotenv.config();
mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log("mongoDB connected"))
    .catch((error)=> console.error("MongoDB connection error: ",error))

const app = express();
const PORT = process.env.PORT || 5000;

// Global limiter — all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
})

// Strict limiter — AI review route only
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                     // 5 resume uploads per hour
  message: { error: 'You have reached the maximum of 5 resume reviews per hour. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
})

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));

app.use(express.json());

app.use(globalLimiter)

app.use('/api/review', reviewLimiter)

app.use('/api',reviewRoutes);

app.use('/api/auth',authRoutes);

app.get('/', (req, res) => {
    res.json({message: 'Welcome to the Resume Reviewer API'});
});

app.get('/health' , (req,res) => {
    try{
        res.json({status: 'ok', db: 'connected' , ai: 'connected'});
    } catch (error) {
        res.status(500).json({status: 'error', message: error.message});
    }
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})