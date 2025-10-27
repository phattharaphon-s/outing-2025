// netlify/functions/reset-form.js

// Function นี้จะถูกเรียกจากหน้า Admin เพื่อลบ Form ทิ้ง (Reset Count)
exports.handler = async function(event, context) {
  // 1. เช็ครหัสผ่านที่ส่งมาจาก React
  const { ADMIN_PASSWORD, NETLIFY_ACCESS_TOKEN, NETLIFY_FORM_ID } = process.env;
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: "Invalid request body." };
  }

  // เช็ครหัสผ่านที่ user กรอก (จาก React) เทียบกับรหัสผ่านที่เราตั้งไว้
  if (body.password !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: "Unauthorized: Invalid Password" };
  }

  // 2. ถ้าผ่าน ให้ลบ Form
  if (!NETLIFY_ACCESS_TOKEN || !NETLIFY_FORM_ID) {
    return { statusCode: 500, body: "Missing Netlify environment variables" };
  }

  const url = `https://api.netlify.com/api/v1/forms/${NETLIFY_FORM_ID}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`
      }
    });

    // 204 คือลบสำเร็จ, 404 คือไม่เจอ (อาจจะลบไปแล้ว) ถือว่าสำเร็จทั้งคู่
    if (response.status === 204 || response.status === 404) {
      return {
        statusCode: 200, 
        body: JSON.stringify({ message: "Form and all submissions successfully deleted." })
      };
    } else {
      return { statusCode: response.status, body: response.statusText };
    }

  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};