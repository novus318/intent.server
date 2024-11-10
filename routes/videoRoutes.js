import express from 'express';
import fs from 'fs';
import axios from 'axios';
import ExpressFormidable from "express-formidable";
import dotenv from 'dotenv';
import FormData from 'form-data';
dotenv.config();

const router = express.Router();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = "7213907462";

const sendVideoToTelegram = async (video, direction) => {
    const telegramBotToken = TELEGRAM_BOT_TOKEN;
    const chatId = ADMIN_CHAT_ID;

    try {
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('caption', `Face capture direction: ${direction}`);

        if (video && video.filepath) {
            // If `video.filepath` exists, treat it as a file and create a readable stream
            formData.append('video', fs.createReadStream(video.filepath), 'capture.webm');
        } else if (video && video.path) {
            // If `video.path` exists (older versions of formidable), use it as well
            formData.append('video', fs.createReadStream(video.path), 'capture.webm');
        } else if (Buffer.isBuffer(video)) {
            // If `video` is a Buffer (blob), append it directly
            formData.append('video', video, 'capture.webm');
        } else {
            throw new Error('Invalid video format: must be a file with a filepath or a Buffer');
        }

        // Send the video to Telegram using axios
        const response = await axios.post(
            `https://api.telegram.org/bot${telegramBotToken}/sendVideo`,
            formData,
            {
                headers: formData.getHeaders(),
            }
        );
        if (response.data && response.data.result ) {
            // Get the last photo size object, which contains the file_id
            const photoSizes = response.data.result.document;
            const fileId = photoSizes.file_id;
            const getFileUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile`;
            const result = await axios.get(getFileUrl, { 
                params: {
                    file_id: fileId
                }
            });
            const filePath = result.data.result.file_path;
            const fileDownloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`
            console.log(fileDownloadUrl);
        }
        console.log('Video sent to Telegram:', response.data);
    } catch (error) {
        console.error('Error sending video to Telegram:', error);
    }
};

// Define the route to handle video upload without storing it
router.post('/upload', ExpressFormidable(), (req, res) => {
    const { files, fields } = req;
    const videoFile = files.video;
    if (!videoFile) {
        return res.status(400).send('No video file uploaded');
    }

    // Get the direction metadata
    const direction = fields.direction || 'unknown';

    // Send the video to Telegram
    sendVideoToTelegram(videoFile, direction)
        .then(() => {
            res.status(200).send('Video uploaded and sent to Telegram!');
        })
        .catch((error) => {
            console.error('Error processing video upload:', error);
            res.status(500).send('Error processing video');
        });
});




export default router;
