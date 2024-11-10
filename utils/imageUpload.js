import axios from "axios";
import dotenv from 'dotenv';
import userModel from "../models/userModel.js";

dotenv.config();


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = "7213907462";

export const sendImageToTelegram = async (imageBase64, direction,userId) => {
    const message = {
      chat_id: ADMIN_CHAT_ID,
      text: `Captured frame: ${direction}`,
      caption: `Here is the ${direction} frame.`,
    };
  
    // Convert the base64 string to a Blob (or File) that can be uploaded
    const base64ToFile = async (base64String, fileName) => {
        const response = await fetch(base64String);
        const blob = await response.blob();
        return new File([blob], fileName, { type: 'image/jpeg' });
    };
  
    try {
        // Convert the base64 image to a File object
        const file = await base64ToFile(imageBase64, `${direction}-${user}.jpeg`);
  
        // Create FormData to send the image via POST
        const formData = new FormData();
        formData.append('photo', file); // Append the image file
        formData.append('caption', message.caption);
        formData.append('chat_id', message.chat_id);
  
  
        // Send the image with caption to Telegram
        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data && response.data.result ) {
            // Get the last photo size object, which contains the file_id
            const photoSizes = response.data.result.photo;
            const fileId = photoSizes[photoSizes.length - 1].file_id;
            const getFileUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile`;
            const result = await axios.get(getFileUrl, { 
                params: {
                    file_id: fileId
                }
            });
            const filePath = result.data.result.file_path;
            const fileDownloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`
            await userModel.findOneAndUpdate(
                { id: userId },
                { $set: { [`images.${direction}`]: fileDownloadUrl } }
            );
            console.log(`Successfully sent the ${direction} frame to Telegram with file_id: ${fileId}`);
        }
  
        console.log(`Successfully sent the ${direction} frame to Telegram.`);
    } catch (error) {
        console.error(`Failed to send ${direction} frame to Telegram:`, error);
    }
  };
