import express from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import path from "path"
import morgan from "morgan"
import connectDB from "./config/db.js"
import userRoutes from './routes/userRoutes.js'
import videoRoutes from './routes/videoRoutes.js'
import imageRoutes from './routes/imageRoutes.js'



const app = express();
const PORT = 8000;
app.use(cors({
  origin: true // Allow all origins
}));
dotenv.config({ path: './.env' })

// Middleware to parse JSON bodies
app.use(express.json())
app.use(morgan('dev'))

//database configcon
connectDB();

app.get('/api', async (req, res) => {
    res.send('app started running you can fetch api results')
    })
//routes

app.use('/api/user',userRoutes)
app.use('/api/image',imageRoutes)
app.use('/api/video',videoRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
