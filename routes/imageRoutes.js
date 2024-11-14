import express from "express";
import axios from "axios";
import { sendImageToTelegram } from "../utils/imageUpload.js";
import userModel from "../models/userModel.js";
const router = express.Router()



router.post('/upload/:id', async (req, res) => {
  const { id } = req.params;
  const { capturedFrames } = req.body;
  const { center, left, right, up, down } = capturedFrames;

  if (!capturedFrames) {
    return res.status(400).json({
      success: false,
      message: "Invalid image frames",
      data: null
    });
  }

  // Send each frame to Telegram
  try {
    const user = await userModel.findOne({ id });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const imageUrls = {};

    if (center) imageUrls.center = await sendImageToTelegram(center, 'center', id);
    if (left) imageUrls.left = await sendImageToTelegram(left, 'left', id);
    if (right) imageUrls.right = await sendImageToTelegram(right, 'right', id);
    if (up) imageUrls.up = await sendImageToTelegram(up, 'up', id);
    if (down) imageUrls.down = await sendImageToTelegram(down, 'down', id);

    if (!user.imageUrls) {
      user.imageUrls = imageUrls;
    } else {
      user.imageUrls = { ...user.imageUrls, ...imageUrls };
    }

    await user.save();

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


router.post('/ai-image/process/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find user by ID
    const user = await userModel.findOne({ id });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Helper function to fetch gender from Nyckel
    const fetchGender = async (imageUrl) => {
      try {
        const response = await axios.post(
          'https://www.nyckel.com/v1/functions/gender-detector/invoke',
          { data: imageUrl },
          {
            headers: {
              'Authorization': 'Bearer ' + process.env.NYCKEL_TOKEN, // Use environment variable for the token
              'Content-Type': 'application/json',
            }
          }
        );
        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error(`Error fetching gender for ${imageUrl}:`, error);
        throw error;
      }
    };

    // Fetch gender for each image and check probability
    const genderResults = {};
    const directions = ['center', 'left', 'right', 'up', 'down'];
    let maleCount = 0;
    let femaleCount = 0;

    for (const direction of directions) {
      const imageUrl = user.imageUrls[direction];
      if (imageUrl) {
        const data = await fetchGender(imageUrl);

        // Extract labelName and confidence from Nyckel's response
        const { labelName, confidence } = data;

        // Confirm gender only for valid labels with high confidence
        if (confidence >= 0.9) {
          if (labelName === "Woman") {
            genderResults[direction] = 'female';
            femaleCount++;
          } else if (labelName === "Man") {
            genderResults[direction] = 'male';
            maleCount++;
          } else {
            genderResults[direction] = 'uncertain';
          }
        } else {
          genderResults[direction] = 'uncertain';
        }
      }
    }

    // Determine final gender based on majority
    if (maleCount > femaleCount) {
      user.confirmed_gender = 'male';
      await user.save();
    } else if (femaleCount > maleCount) {
      user.confirmed_gender = 'female';
      await user.save();
    }

    res.status(200).send({ message: 'Gender processing completed', confirmed_gender: user.confirmed_gender, genderResults });
  } catch (err) {
    console.error('Error processing AI images:', err);
    res.status(500).send('Error processing AI images');
  }
});



export default router