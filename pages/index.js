import React, { useState, useRef } from 'react';

export default function VideoEditor() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [currentStep, setCurrentStep] = useState('upload');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setCurrentStep('setup');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        setCurrentStep('setup');
      }
    }
  };

  const analyzeVideo = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setCurrentStep('edit');
    setIsAnalyzing(false);
  };

  if (currentStep === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎬 עורך וידאו AI
            </h1>
            <p className="text-xl text-gray-600">העלה וידאו ותן ל-AI לעזור לך ליצור קמפיין שיווקי מושלם</p>
          </div>

          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-white hover:border-purple-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">העלה קובץ וידאו</h3>
            <p className="text-gray-600 mb-4">גרור וידאו לכאן או לחץ לבחירת קובץ</p>
            <p className="text-sm text-gray-500">תומך ב: MP4, MOV, AVI (עד 100MB)</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">הגדרת קמפיין</h2>
            <p className="text-gray-600">ספר לנו על המטרה שלך כדי שנוכל להתאים את העריכה</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="text-lg font-semibold text-gray-900 mb-4 block">
                  🎯 מה המטרה של הקמפיין?
                </label>
                <select
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">בחר מטרה</option>
                  <option value="sales">💰 מכירות</option>
                  <option value="awareness">🏢 מודעות לברנד</option>
                  <option value="engagement">📱 אנגיימנט</option>
                  <option value="education">📚 חינוך ותוכן</option>
                  <option value="recruitment">👥 גיוס עובדים</option>
                </select>
              </div>

              <div>
                <label className="text-lg font-semibold text-gray-900 mb-4 block">
                  👥 מי קהל היעד?
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">בחר קהל יעד</option>
                  <option value="young-adults">🧑‍💻 צעירים (18-30)</option>
                  <option value="professionals">👔 אנשי מקצוע (30-50)</option>
                  <option value="families">👨‍👩‍👧‍👦 משפחות</option>
                  <option value="seniors">👴 גיל השלישי</option>
                  <option value="businesses">🏢 עסקים</option>
                </select>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={analyzeVideo}
                disabled={!campaignGoal || !targetAudience || isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-pulse">🔄</span> מנתח וידאו...
                  </>
                ) : (
                  <>
                    ✨ נתח עם AI
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">תצוגה מקדימה</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={videoUrl}
                className="w-full h-full object-contain"
                controls
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🎬 עורך הוידאו</h2>
          <p className="text-gray-600">עריכה מתקדמת מבוססת AI</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video
                src={videoUrl}
                className="w-full h-full object-contain"
                controls
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✂️ חיתוכים מוצעים</h4>
                <div className="text-sm text-green-700">
                  0:02-0:08: חיתוך דינמי למכירות<br/>
                  0:12-0:20: מיקוד בתגובות חיוביות
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">⭐ מומנטים מרכזיים</h4>
                <div className="text-sm text-blue-700">
                  0:05: מומנט מרכזי - הצגת המוצר<br/>
                  0:15: תגובת הקהל<br/>
                  0:25: קריאה לפעולה
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                ✨ ניתוח AI
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800">מצב רוח:</h4>
                  <p className="text-gray-600">אנרגטי ואופטימי</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800">רגשות זוהו:</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">😊 שמחה</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">🤩 התרגשות</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">🧐 סקרנות</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                💬 כתוביות
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="border border-gray-200 rounded p-3">
                  <div className="text-sm text-gray-500 mb-1">0:00 - 0:03</div>
                  <div className="text-gray-800">שלום! ברוכים הבאים</div>
                </div>
                <div className="border border-gray-200 rounded p-3">
                  <div className="text-sm text-gray-500 mb-1">0:03 - 0:07</div>
                  <div className="text-gray-800">היום נציג לכם מוצר מדהים</div>
                </div>
                <div className="border border-gray-200 rounded p-3">
                  <div className="text-sm text-gray-500 mb-1">0:07 - 0:12</div>
                  <div className="text-gray-800">שישנה את האופן שבו אתם עובדים</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">פעולות</h3>
              
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg">
                  ✂️ חתוך אוטומטי
                </button>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg">
                  💾 ייצא וידאו
                </button>
                
                <button 
                  onClick={() => setCurrentStep('upload')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg"
                >
                  🆕 וידאו חדש
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}