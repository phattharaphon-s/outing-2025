// netlify/functions/get-submissions.js

// นี่คือ Function ที่จะไปดึงข้อมูลจาก Netlify API
// โดยใช้ Access Token ที่เราจะตั้งค่าใน Environment Variables
exports.handler = async function(event, context) {
  const { NETLIFY_ACCESS_TOKEN, NETLIFY_FORM_ID } = process.env;
  
  if (!NETLIFY_ACCESS_TOKEN || !NETLIFY_FORM_ID) {
    return { statusCode: 500, body: "Missing Netlify environment variables" };
  }

  const url = `https://api.netlify.com/api/v1/forms/${NETLIFY_FORM_ID}/submissions`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch submissions:', response.statusText);
      return { statusCode: response.status, body: response.statusText };
    }

    const submissions = await response.json();

    // ส่งข้อมูล submissions ทั้งหมดกลับไปให้ React
    return {
      statusCode: 200,
      body: JSON.stringify({ submissions: submissions || [] })
    };

  } catch (error) {
    console.error('Error in get-submissions function:', error);
    return { statusCode: 500, body: error.toString() };
  }
};