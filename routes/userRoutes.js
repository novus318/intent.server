import express from "express";
import userModel from "../models/userModel.js";
import useragent from 'useragent';
import axios from "axios";
const router = express.Router()


router.post('/create', async (req, res) => {
    const { userData } = req.body
    console.log(userData)
    if (!userData.id) {
        return res.status(400).json({
            success: false,
            message: "Invalid user data",
            data: null
        })
    }
    try {
        const existingUser = await userModel.findOne({ id: userData.id });
        if (existingUser) {
            return res.status(201).json({
                success: true,
                message: "User already exists",
                data: existingUser
            })
        }

        const ipAddress = userData.ip;

        const geoResponse = await axios.get(`http://ip-api.com/json/${ipAddress}`);
        const { city, regionName, country, isp, lat, lon } = geoResponse.data;
        const coordinates = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
        };
        const agent = useragent.parse(req.headers['user-agent']);
        const device = agent.device.toString(); 
        const userDetails = {
            id: userData.id,
            photo_url: userData.photo_url,
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
            language_code: userData.language_code,
            is_bot: userData.is_bot,
            is_premium: userData.is_premium,
            ip: ipAddress,
            isp: isp,
            coordinates: coordinates,
            city: city,
            regionName: regionName,
            country: country,
            device: device,
        };

        const newUser = new userModel(userDetails);
        await newUser.save();
        res.status(201).json({ success: true, message: "User created successfully", data: newUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false, message: "Error creating user", data
                : error
        });
    }
})

router.put('/update/:id', async (req, res) => {
    const id = req.params.id;
    const {formData}  = req.body;
    const  userData = formData;
    try {
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Invalid user data",
                data: null
            })
        }
        const user = await userModel.findOne({ id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            })
        }
        const [firstName, ...lastNameParts] = (userData.name || "").split(" ");
        const lastName = lastNameParts.join(" ");
        
        user.first_name = firstName || null;
        user.last_name = lastName || null;
    
        // Explicitly assign fields, using null if undefined
        user.about = userData.about ?? null;
        user.dob = userData.dob ?? null;
        user.gender = userData.gender ?? null;

        await user.save();
        res.status(200).json({ success: true, message: "User updated successfully", data: user });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false, message: "Error updating user", data
                : error
        }); 
    }
})

router.get('/get/:id', async (req, res) => {
    const { id } = req.params
    try {
        const user = await userModel.findOne({ id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            })
        }
        res.status(200).json({ success: true, message: "User fetched successfully", data: user });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false, message: "Error fetching user", data
                    : error
            });
    }
    })


export default router