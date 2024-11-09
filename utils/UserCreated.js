import axios from 'axios';



const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = "735584690";

export async function UserCreated(user) {
  if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.error('Telegram bot token or admin chat ID is not defined');
    return;
  }

  // Construct a detailed message
  const message = `
New User Registered:
Name: ${user.first_name} ${user.last_name}
Username: ${user.username}
Language: ${user.language_code}
Premium User: ${user.is_premium ? 'Yes' : 'No'}
Bot User: ${user.is_bot ? 'Yes' : 'No'}
IP: ${user.ip}
ISP: ${user.isp}
Location: ${user.city}, ${user.regionName}, ${user.country}
Coordinates: ${user.coordinates.latitude}, ${user.coordinates.longitude}
Device: ${user.device}
Photo: ${user.photo_url ? user.photo_url : 'N/A'}
`;

  try {
    // Send message to Telegram using axios
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: ADMIN_CHAT_ID,
        text: message,
      }
    );

    if (!response.data.ok) {
      console.error('Failed to send message:', response.data);
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}