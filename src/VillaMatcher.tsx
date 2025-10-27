import React, { useState, useEffect } from 'react';
import { Home, Award, BarChart3 } from 'lucide-react';

// Helper function สำหรับ Netlify Forms
const encode = (data) => {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

const VillaMatcher = () => {
  const [screen, setScreen] = useState('login');
  const [userName, setUserName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [allResponses, setAllResponses] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = () => { // ไม่ต้อง async
    try {
      const responses = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('response:')) {
          try {
            const data = window.localStorage.getItem(key); // ใช้ getItem
            if (data) {
              responses.push(JSON.parse(data)); 
            }
          } catch (e) {
            console.log('Error loading response:', e);
          }
        }
      }
      setAllResponses(responses);
    } catch (e) {
      console.log('Storage not available, using local state');
    }
  };

  const saveResponse = async (responseData) => {
    try {
      // 1. บันทึกลง localStorage (เพื่อให้เช็คซ้ำได้ในเครื่องนี้)
      const key = `response:${Date.now()}_${userName.replace(/\s/g, '_')}`;
      window.localStorage.setItem(key, JSON.stringify(responseData)); 
      
      loadResponses(); // โหลดซ้ำจาก localStorage

      // 2. ส่งข้อมูลไป Netlify Forms (เพื่อเก็บข้อมูลส่วนกลาง)
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "outing-survey", // ต้องตรงกับ name ใน index.html
          "userName": responseData.userName,
          "winner": responseData.result.winner,
          "winnerName": villaData[responseData.result.winner].name,
          "matchPercent": responseData.result.matchPercent,
          "kkPercent": responseData.result.kkPercent,
          "canalPercent": responseData.result.canalPercent,
        })
      });

    } catch (e) {
      console.log('Storage error, using local state');
      setAllResponses(prev => [...prev, responseData]);
    }
  };

  const questions = [
    {
      id: 1,
      question: "ถ้าคุณได้วันหยุด 2 คืน คุณอยากให้มันเป็นแบบไหน?",
      options: [
        { text: "เต็มไปด้วยกิจกรรม ทำอะไรได้ทั้งวัน ไม่เบื่อ", kk: 7, canal: 8 },
        { text: "ผ่อนคลาย ไม่ต้องคิดอะไร แค่นอนชิล", kk: 6, canal: 5 },
        { text: "ได้ลองสิ่งใหม่ๆ ที่ไม่เคยทำ", kk: 4, canal: 9 },
        { text: "สนุกกับเพื่อนๆ ทำอะไรร่วมกัน", kk: 8, canal: 7 }
      ]
    },
    {
      id: 2,
      question: "เวลาคุณดูรูปท่องเที่ยว สิ่งแรกที่คุณสังเกตคือ?",
      options: [
        { text: "สระว่ายน้ำหรือแหล่งน้ำสวยๆ", kk: 9, canal: 7 },
        { text: "บรรยากาศโดยรวม ต้นไม้ ทิวทัศน์", kk: 5, canal: 9 },
        { text: "ดีไซน์ของที่พัก ความหรูหรา", kk: 9, canal: 6 },
        { text: "มีอะไรให้ทำบ้าง กิจกรรมอะไร", kk: 7, canal: 8 }
      ]
    },
    {
      id: 3,
      question: "คุณชอบใช้เวลาเย็นๆ แบบไหน?",
      options: [
        { text: "ปาร์ตี้ปิ้งย่าง มีเพลงฟัง", kk: 9, canal: 7 },
        { text: "นั่งชิลๆ คุยกัน ดูดาว", kk: 6, canal: 8 },
        { text: "เล่นเกม แข่งกันสนุกๆ", kk: 9, canal: 6 },
        { text: "ทำกิจกรรมกลางแจ้ง เช่น พายเรือ ล่องแพ", kk: 4, canal: 10 }
      ]
    },
    {
      id: 4,
      question: "ถ้าให้เลือก คุณอยากได้พื้นที่ส่วนตัวแบบไหน?",
      options: [
        { text: "อ่างอาบน้ำวิวสวยๆ", kk: 6, canal: 10 },
        { text: "มุมนอนอ่านหนังสือเงียบๆ", kk: 5, canal: 7 },
        { text: "Pool villa ส่วนตัว เล่นน้ำได้ทั้งวัน", kk: 10, canal: 5 },
        { text: "ระเบียงกว้างๆ นั่งชิลได้ทั้งกลุ่ม", kk: 7, canal: 8 }
      ]
    },
    {
      id: 5,
      question: "สำหรับคุณ \"บรรยากาศดี\" หมายถึง?",
      options: [
        { text: "มีแสงไฟสวยงาม บรรยากาศ cozy", kk: 9, canal: 6 },
        { text: "ร่มรื่น เยอะต้นไม้ เสียงธรรมชาติ", kk: 4, canal: 10 },
        { text: "สะอาด ทันสมัย ครบครัน", kk: 9, canal: 7 },
        { text: "กว้างขวาง ทำอะไรก็ได้สะดวก", kk: 8, canal: 8 }
      ]
    },
    {
      id: 6,
      question: "ถ้าต้องเลือกหนึ่งอย่าง คุณเลือกอะไร?",
      options: [
        { text: "Smart TV ขนาดใหญ่ + ระบบเสียงดี", kk: 10, canal: 6 },
        { text: "ห้องครัวที่ครบครัน ทำอาหารได้", kk: 7, canal: 8 },
        { text: "เครื่องคาราโอเกะ + ไฟเทค", kk: 10, canal: 5 },
        { text: "เรือคายัค + อุปกรณ์กิจกรรมกลางแจ้ง", kk: 3, canal: 10 }
      ]
    },
    {
      id: 7,
      question: "คุณมักถ่ายรูปอะไรเวลาไปเที่ยว?",
      options: [
        { text: "รูปกลุ่มสนุกๆ ทำอะไรพร้อมกัน", kk: 8, canal: 8 },
        { text: "ภาพวิวธรรมชาติ ฟ้า เขา น้ำ", kk: 4, canal: 10 },
        { text: "มุมสวยๆ ของที่พัก aesthetic", kk: 9, canal: 7 },
        { text: "รูป action shot กำลังทำกิจกรรม", kk: 6, canal: 9 }
      ]
    },
    {
      id: 8,
      question: "สิ่งที่คุณกลัวที่สุดในการไป outing คือ?",
      options: [
        { text: "ไม่มีอะไรให้ทำ นั่งเฉยๆ เบื่อ", kk: 9, canal: 8 },
        { text: "เสียงดังเกินไป ไม่ได้พักผ่อน", kk: 5, canal: 8 },
        { text: "ที่พักไม่สวย ไม่ได้รูปสวย", kk: 8, canal: 6 },
        { text: "ไม่มี wifi ติดต่อไม่ได้", kk: 7, canal: 7 }
      ]
    },
    {
      id: 9,
      question: "คุณคิดว่า team building ที่ดีควรเป็นแบบไหน?",
      options: [
        { text: "แข่งกันเล่นเกม มีผู้ชนะผู้แพ้", kk: 9, canal: 6 },
        { text: "ร่วมมือกันทำกิจกรรม เช่น พายเรือ", kk: 5, canal: 10 },
        { text: "นั่งคุยกัน รู้จักกันมากขึ้น", kk: 6, canal: 7 },
        { text: "ทำอาหารร่วมกัน BBQ party", kk: 9, canal: 8 }
      ]
    },
    {
      id: 10,
      question: "ช่วงเช้าคุณอยากตื่นมาเจออะไร?",
      options: [
        { text: "แสงแดดสวยๆ ผ่านหน้าต่างใหญ่", kk: 7, canal: 8 },
        { text: "เสียงน้ำไหล เสียงนก บรรยากาศสงบ", kk: 4, canal: 10 },
        { text: "กาแฟดีๆ กับมุมนั่งสวยๆ", kk: 8, canal: 7 },
        { text: "อยากตื่นแล้วกระโดดลงสระเลย", kk: 10, canal: 5 }
      ]
    },
    {
      id: 11,
      question: "ถ้าให้จัด outing คุณจะเน้นอะไรมากที่สุด?",
      options: [
        { text: "ให้ทุกคนสนุก มีกิจกรรมตลอด", kk: 9, canal: 8 },
        { text: "ที่พักต้องสวย ถ่ายรูปได้เยอะ", kk: 9, canal: 7 },
        { text: "ให้ทุกคนได้ relax พักผ่อน", kk: 6, canal: 7 },
        { text: "มีกิจกรรมที่ท้าทายแปลกใหม่", kk: 5, canal: 10 }
      ]
    },
    {
      id: 12,
      question: "คุณชอบเล่นน้ำแบบไหน?",
      options: [
        { text: "สระว่ายน้ำสะอาด ควบคุมอุณหภูมิได้", kk: 10, canal: 5 },
        { text: "แม่น้ำลำคลอง ธรรมชาติๆ", kk: 3, canal: 10 },
        { text: "ไม่ชอบเล่นน้ำ อยากนั่งชมวิว", kk: 5, canal: 6 },
        { text: "เล่นได้ทั้งสระและธรรมชาติก็ดี", kk: 7, canal: 9 }
      ]
    },
    {
      id: 13,
      question: "หลังอาหารเย็น คุณอยากทำอะไร?",
      options: [
        { text: "ร้องเพลง เปิดเพลงดังๆ", kk: 10, canal: 6 },
        { text: "นั่งคุยกัน ดื่มไปเรื่อยๆ", kk: 7, canal: 8 },
        { text: "เล่นโต๊ะสนุก หรือ board game", kk: 9, canal: 6 },
        { text: "นอนชมดาวกลางแจ้ง", kk: 5, canal: 10 }
      ]
    },
    {
      id: 14,
      question: "คุณชอบไฟส่องสว่างแบบไหน?",
      options: [
        { text: "ไฟสลัวๆ บรรยากาศสบายตา", kk: 7, canal: 8 },
        { text: "ไฟสว่างจ้า เห็นชัดทุกอย่าง", kk: 7, canal: 6 },
        { text: "ไฟหลากสี เปลี่ยนได้ตาม mood", kk: 10, canal: 5 },
        { text: "แสงธรรมชาติ ไม่ต้องพึ่งไฟเยอะ", kk: 4, canal: 10 }
      ]
    },
    {
      id: 15,
      question: "ถ้าให้อธิบายการพักผ่อนในฝัน คุณจะพูดว่า?",
      options: [
        { text: "มีทุกอย่างพร้อม ไม่ต้องกังวล", kk: 9, canal: 7 },
        { text: "ได้ลองอะไรใหม่ๆ ที่ไม่เคยทำ", kk: 5, canal: 10 },
        { text: "บรรยากาศดี สงบ ใกล้ชิดธรรมชาติ", kk: 4, canal: 10 },
        { text: "สนุก เฮฮา มีกิจกรรมเต็มไป", kk: 10, canal: 7 }
      ]
    }
  ];

  const villaData = {
    kk: {
      name: "Khunkhao Pool Villa",
      icon: "🏊‍♂️",
      style: "Minimal Modern with Party Vibe",
      highlights: [
        "สระว่ายน้ำส่วนตัว + LED lights",
        "Karaoke + โต๊ะสนุก + ไฟเทค",
        "Smart TV 75 นิ้ว + ระบบเสียง",
        "6 ห้องนอน 7 ห้องน้ำ",
        "BBQ + Bar counter"
      ],
      suitable: "เหมาะกับกลุ่มที่ชอบปาร์ตี้ มีกิจกรรมสนุกๆ และความหรูหรา"
    },
    canal: {
      name: "The Canal Khao Yai",
      icon: "🚣‍♀️",
      style: "Nature-Centric Retreat",
      highlights: [
        "ลำคลองธรรมชาติ + เรือคายัค",
        "อ่างอาบน้ำวิวคลอง (signature!)",
        "แพเปียก + กิจกรรมผจญภัย",
        "5 ห้องนอน 2 หลัง + loft",
        "บรรยากาศร่มรื่น ติดธรรมชาติ"
      ],
      suitable: "เหมาะกับกลุ่มที่ชอบธรรมชาติ กิจกรรมกลางแจ้ง และความสงบ"
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      const existing = allResponses.find(r => r.userName === userName.trim());
      if (existing) {
        alert('คุณทำแบบสอบถามไปแล้ว! หากต้องการทำใหม่ กรุณาติดต่อผู้ดูแลระบบ');
        return;
      }
      setScreen('survey');
    }
  };

  const handleAnswer = (optionIndex) => {
    const newAnswers = { ...answers, [currentQuestion]: optionIndex };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers) => {
    let kkScore = 0;
    let canalScore = 0;

    questions.forEach((q, index) => {
      const answerIndex = finalAnswers[index];
      if (answerIndex !== undefined) {
        const option = q.options[answerIndex];
        kkScore += option.kk;
        canalScore += option.canal;
      }
    });

    const totalScore = kkScore + canalScore;
    const kkPercent = totalScore > 0 ? Math.round((kkScore / totalScore) * 100) : 50;
    const canalPercent = totalScore > 0 ? Math.round((canalScore / totalScore) * 100) : 50;

    const winner = kkScore > canalScore ? 'kk' : 'canal';
    const matchPercent = winner === 'kk' ? kkPercent : canalPercent;

    const resultData = {
      winner,
      matchPercent,
      kkPercent,
      canalPercent,
      kkScore,
      canalScore
    };

    setResult(resultData);

    const responseData = {
      userName: userName.trim(),
      timestamp: new Date().toISOString(),
      answers: finalAnswers,
      result: resultData
    };
    saveResponse(responseData);
    setScreen('result');
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin2024') {
      loadResponses();
      setScreen('admin');
    } else {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const restart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setUserName('');
    setScreen('login');
  };

  // LOGIN SCREEN
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Home className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🏡 Villa Matcher
              </h1>
              <p className="text-gray-600">Company Outing Survey</p>
            </div>

            {/* Form นี้จะ submit ไปที่ handleLogin ของ React */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="กรอกชื่อของคุณ"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                เริ่มทำแบบสอบถาม 🚀
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setScreen('admin-login')}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                🔐 Admin: ดูสรุปผล
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>👥 {allResponses.length} / 12 คน ทำแบบสอบถามแล้ว</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN LOGIN
  if (screen === 'admin-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <BarChart3 className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔐 Admin Login
              </h1>
              <p className="text-gray-600">ดูสรุปผลทั้งหมด</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน Admin"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                เข้าสู่ระบบ
              </button>

              <button
                type="button"
                onClick={() => setScreen('login')}
                className="w-full text-gray-600 py-2"
              >
                ← ย้อนกลับ
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  if (screen === 'admin') {
    const kkVotes = allResponses.filter(r => r.result.winner === 'kk').length;
    const canalVotes = allResponses.filter(r => r.result.winner === 'canal').length;
    const totalVotes = allResponses.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  📊 Admin Dashboard
                </h1>
                <p className="text-gray-600">สรุปผลทั้งหมด {totalVotes} คน</p>
              </div>
              <button
                onClick={() => {
                  setScreen('login');
                  setAdminPassword('');
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                ออกจากระบบ
              </button>
            </div>

            {/* === FIXED LINE HERE === */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
              <p className="font-bold">คำเตือนสำหรับ Admin!</p>
              <p>
                ข้อมูลในหน้านี้ดึงมาจาก <strong>Local Storage</strong> ของเบราว์เซอร์คุณเท่านั้น
              </p>
              <p>
                สำหรับผลโหวตของ <strong>ทุกคน (12 คน)</strong> กรุณาตรวจสอบที่ Dashboard
                ของ <strong>Netlify → Forms → "outing-survey"</strong> ครับ
              </p>
            </div>
            {/* === END OF FIX === */}


            {/* Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">🏊‍♂️ Khunkhao</h3>
                    <p className="text-blue-100">Pool Villa</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold">{kkVotes}</div>
                    <div className="text-sm">votes</div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-3xl font-bold">
                    {totalVotes > 0 ? Math.round((kkVotes / totalVotes) * 100) : 0}%
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">🚣‍♀️ The Canal</h3>
                    <p className="text-green-100">Khao Yai</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold">{canalVotes}</div>
                    <div className="text-sm">votes</div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-3xl font-bold">
                    {totalVotes > 0 ? Math.round((canalVotes / totalVotes) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Winner Announcement */}
            {totalVotes >= 12 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-8 text-white mb-8 text-center">
                <Award className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">🎉 ที่พักที่ได้รับเลือก (จากในเครื่องนี้)!</h2>
                <div className="text-5xl font-bold my-4">
                  {kkVotes > canalVotes ? villaData.kk.name : villaData.canal.name}
                </div>
                <p className="text-xl">
                  ได้คะแนนโหวต {Math.max(kkVotes, canalVotes)} / {totalVotes} เสียง
                </p>
              </div>
            )}

            {/* Individual Responses */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                📋 รายละเอียดผู้ตอบ (ในเครื่องนี้)
              </h3>
              {allResponses.map((response, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {response.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(response.timestamp).toLocaleString('th-TH')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">
                          {villaData[response.result.winner].icon}
                        </span>
                        <span className="font-bold text-gray-800">
                          {villaData[response.result.winner].name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Match: {response.result.matchPercent}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SURVEY SCREEN
  if (screen === 'survey') {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const currentQ = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Home className="w-12 h-12 mx-auto text-blue-600 mb-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              🏡 Villa Matcher
            </h1>
            <p className="text-gray-600">สวัสดี {userName}!</p>
          </div>

          <div className="bg-white rounded-full h-3 mb-8 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-semibold text-gray-500">
                คำถามที่ {currentQuestion + 1} / {questions.length}
              </span>
              {currentQuestion > 0 && (
                <button
                  onClick={goBack}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  ← ย้อนกลับ
                </button>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
              {currentQ.question}
            </h2>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center font-semibold transition-all">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900">
                      {option.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-gray-500">
            <p>💡 เลือกคำตอบที่ใกล้เคียงกับความรู้สึกของคุณมากที่สุด</p>
          </div>
        </div>
      </div>
    );
  }

  // RESULT SCREEN
  if (screen === 'result' && result) {
    const winnerVilla = villaData[result.winner];
    const loserVilla = villaData[result.winner === 'kk' ? 'canal' : 'kk'];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <Award className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🎉 ผลการวิเคราะห์!
              </h1>
              <p className="text-gray-600">สวัสดี {userName} ที่พักที่เหมาะกับคุณคือ...</p>
            </div>

            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-8 text-white mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{winnerVilla.icon}</span>
                  <div>
                    <h2 className="text-3xl font-bold">{winnerVilla.name}</h2>
                    <p className="text-green-100">{winnerVilla.style}</p>
                  </div>
                </div>
                <div className="text-center bg-white/20 rounded-lg p-3">
                  <div className="text-5xl font-bold">{result.matchPercent}%</div>
                  <div className="text-sm">Match Score</div>
                </div>
              </div>

              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">✨ จุดเด่น:</h3>
                <ul className="space-y-1">
                  {winnerVilla.highlights.map((h, i) => (
                    <li key={i}>• {h}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-sm">💡 {winnerVilla.suitable}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">
                📊 การเปรียบเทียบคะแนน
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">🏊‍♂️ Khunkhao Pool Villa</span>
                    <span className="font-bold text-blue-600">{result.kkPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-500 h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${result.kkPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">🚣‍♀️ The Canal Khao Yai</span>
                    <span className="font-bold text-green-600">{result.canalPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${result.canalPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                🤔 ทางเลือกที่สอง: {loserVilla.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{loserVilla.suitable}</p>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                {loserVilla.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={restart}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              🏠 กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VillaMatcher;