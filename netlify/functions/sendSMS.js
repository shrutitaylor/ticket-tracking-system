const axios = require("axios");

exports.handler = async function (event, context) {
  try {
    const { phoneNumber, message } = JSON.parse(event.body);

    const response = await axios.post("https://cellcast.com.au/api/v3/send-sms", {
      sms_text: message,
      numbers: [phoneNumber],
      from: "IO LABS" // optional, can be left out if you want default
    }, {
      headers: {
        APPKEY: process.env.VITE_CELLCAST_API_KEY, 
        "Content-Type": "application/json",
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: response.data }),
    };
  } catch (error) {
    console.error("SMS sending failed:", error.message, error.response?.data);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Failed to send SMS" }),
    };
  }
};
