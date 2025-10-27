// netlify/functions/reset-form.js

exports.handler = async function(event, context) {
  // 1. ตรวจสอบรหัสผ่านและ Environment Variables
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

  if (!NETLIFY_ACCESS_TOKEN || !NETLIFY_FORM_ID) {
    return { statusCode: 500, body: "Missing Netlify environment variables" };
  }

  const authHeader = { 'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}` };

  try {
    // 2. ดึงข้อมูล Submissions ทั้งหมดที่มีอยู่
    const getUrl = `https://api.netlify.com/api/v1/forms/${NETLIFY_FORM_ID}/submissions`;
    const getResponse = await fetch(getUrl, { headers: authHeader });
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch submissions for deletion: ${getResponse.statusText}`);
    }
    
    const submissions = await getResponse.json();

    if (!submissions || submissions.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: "No submissions to delete." }) };
    }

    // 3. วนลูปเพื่อลบ Submission ทีละอัน
    const deletePromises = submissions.map(submission => {
      // API endpoint สำหรับลบ submission แต่ละอัน
      const deleteUrl = `https://api.netlify.com/api/v1/submissions/${submission.id}`; 
      return fetch(deleteUrl, {
        method: 'DELETE',
        headers: authHeader
      });
    });

    // รอให้ทุกการลบเสร็จสิ้น
    const results = await Promise.all(deletePromises);

    // ตรวจสอบว่ามีอันไหนลบไม่สำเร็จหรือไม่
    const failedDeletions = results.filter(res => !res.ok);
    if (failedDeletions.length > 0) {
      console.error('Some submissions failed to delete:', failedDeletions);
      throw new Error(`Failed to delete ${failedDeletions.length} submissions.`);
    }

    // 4. ส่งข้อความกลับไปว่าลบสำเร็จ
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Successfully deleted ${submissions.length} submissions.` })
    };

  } catch (error) {
    console.error('Error in reset-form function:', error);
    return { statusCode: 500, body: error.toString() };
  }
};