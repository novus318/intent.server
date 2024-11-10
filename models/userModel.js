import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    photo_url: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
    language_code: { type: String },
    is_bot: { type: Boolean },
    is_premium: { type: Boolean },
    ip: { type: String },                       
    isp: { type: String },                     
    coordinates: {                               
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    city:{ type: String },
    regionName:{ type: String }, 
    country:{ type: String },
    device: { type: String },                  
    operating_ip: { type: String },          
    gender: { type: String },  
    about:  { type: String },                
    confirmed_gender: { type: Boolean },   
    dob: { type: Date },                
    passport: { type: String },  
    images:{
      center:{
        type: String
      }, left:{
        type: String
      }, right:{
        type: String
      }, up:{
        type: String
      }, down:{
        type: String
      }
    }  
}, { timestamps: true });

export default mongoose.model('User', userSchema);
