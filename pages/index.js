import React, { useState, useRef, useEffect } from 'react';

export default function ProfessionalVideoEditor() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [currentStep, setCurrentStep] = useState('upload');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [cuts, setCuts] = useState([]);
  const [selectedCut, setSelectedCut] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0
  });
  const [timeline, setTimeline] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [showSubtitles, setShowSubtitles] = useState(true);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const timelineRef = useRef(null);

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
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate AI analysis
      const mockSubtitles = [
        { start: 0, end: 3, text: 'שלום! ברוכים הבאים למוצר המהפכני שלנו' },
        { start: 3, end: 7, text: 'היום נציג לכם פתרון שישנה את העסק שלכם' },
        { start: 7, end: 12, text: 'עם תוצאות מוכחות ולקוחות מרוצים ברחבי העולם' },
        { start: 12, end: 16, text: 'בואו נראה איך זה עובד בפועל' },
        { start: 16, end: 20, text: 'התוצאות מדברות בעד עצמן - הצטרפו אלינו היום!' }
      ];
      
      const mockCuts = [
        { id: 1, start: 2, end: 8, type: 'intro', label: 'פתיחה דינמית' },
        { id: 2, start: 8, end: 15, type: 'main', label: 'תוכן מרכזי' },
        { id: 3, start: 15, end: 22, type: 'outro', label: 'קריאה לפעולה' }
      ];

      setSubtitles(mockSubtitles);
      setCuts(mockCuts);
      setTimeline(mockCuts);
      setCurrentStep('edit');
    } catch (error) {
      console.error('שגיאה בניתוח:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const getCurrentSubtitle = () => {
    return subtitles.find(sub => 
      currentTime >= sub.start && currentTime <= sub.end
    );
  };

  const addCut = () => {
    const newCut = {
      id: Date.now(),
      start: currentTime,
      end: Math.min(currentTime + 3, duration),
      type: 'custom',
      label: `חיתוך ${cuts.length + 1}`
    };
    setCuts([...cuts, newCut]);
  };

  const deleteCut = (cutId) => {
    setCuts(cuts.filter(cut => cut.id !== cutId));
    setSelectedCut(null);
  };

  const applyCut = (cut) => {
    seekTo(cut.start);
    setSelectedCut(cut);
  };

  const exportVideo = () => {
    alert('מייצא וידאו עם החיתוכים והאפקטים שנבחרו...\nבגרסה מלאה זה יייצא קובץ וידאו חדש.');
  };

  const applyAutoEdit = () => {
    // Apply AI suggested cuts automatically
    const aiCuts = [
      { id: 'ai1', start: 1, end: 7, type: 'dynamic', label: 'חיתוך AI - דינמי' },
      { id: 'ai2', start: 10, end: 18, type: 'focus', label: 'חיתוך AI - מיקוד' }
    ];
    setCuts([...cuts, ...aiCuts]);
    alert('החיתוכים האוטומטיים של ה-AI הופעלו בהצלחה!');
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.volume = volume;
    }
  }, [playbackSpeed, volume]);

  if (currentStep === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🎬</span>
              </div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                AI Video Studio Pro
              </h1>
            </div>
            <p className="text-2xl text-gray-300 font-light">
              עורך וידאו מקצועי מבוסס בינה מלאכותית ברמה בינלאומית
            </p>
            <div className="mt-6 flex items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>ניתוח AI מתקדם</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>עריכה אוטומטית</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>יצוא 4K</span>
              </div>
            </div>
          </div>

          <div 
            className="relative border-2 border-dashed border-purple-400/50 rounded-2xl p-16 text-center bg-black/20 backdrop-blur-sm hover:border-purple-400 hover:bg-black/30 transition-all duration-300 cursor-pointer group"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300"></div>
            
            <div className="relative z-10">
              <div className="text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">📁</div>
              <h3 className="text-3xl font-bold text-white mb-4">העלה קובץ וידאו מקצועי</h3>
              <p className="text-xl text-gray-300 mb-6">גרור וידאו לכאן או לחץ לבחירת קובץ</p>
              
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-full text-white font-semibold">MP4</div>
                <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-2 rounded-full text-white font-semibold">MOV</div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full text-white font-semibold">AVI</div>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full text-white font-semibold">MKV</div>
              </div>
              
              <p className="text-gray-400">תומך עד 500MB • רזולוציית 4K • פורמטים מקצועיים</p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2">ניתוח AI מתקדם</h3>
              <p className="text-gray-400">זיהוי אוטומטי של רגשות, מומנטים מרכזיים וחיתוכים אופטימליים</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl mb-4">✂️</div>
              <h3 className="text-xl font-bold text-white mb-2">עריכה מקצועית</h3>
              <p className="text-gray-400">Timeline מתקדם, אפקטים, מעברים וכלי עריכה ברמה בינלאומית</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">שיווק חכם</h3>
              <p className="text-gray-400">התאמה אוטומטית לקמפיינים שיווקיים ואופטימיזציה לפלטפורמות</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">🎯 הגדרת קמפיין מתקדמת</h2>
            <p className="text-xl text-gray-300">בחר את המטרות והקהל כדי שה-AI יתאים את העריכה באופן מושלם</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-purple-500/20">
              <div className="grid gap-8">
                <div>
                  <label className="flex items-center gap-3 text-xl font-bold text-white mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                      🎯
                    </div>
                    מטרת הקמפיין
                  </label>
                  <select
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    className="w-full p-4 bg-black/50 border border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
                  >
                    <option value="">בחר מטרה עסקית</option>
                    <option value="sales">💰 מכירות והמרות</option>
                    <option value="awareness">🏢 מודעות לברנד</option>
                    <option value="engagement">📱 אנגיימנט ואינטראקציה</option>
                    <option value="education">📚 חינוך והדרכה</option>
                    <option value="recruitment">👥 גיוס ואיוש</option>
                    <option value="retention">🔄 שימור לקוחות</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3 text-xl font-bold text-white mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      👥
                    </div>
                    קהל היעד
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full p-4 bg-black/50 border border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
                  >
                    <option value="">בחר קהל יעד</option>
                    <option value="young-adults">🧑‍💻 דור המילניום (22-35)</option>
                    <option value="professionals">👔 אנשי מקצוע (35-50)</option>
                    <option value="families">👨‍👩‍👧‍👦 משפחות (25-45)</option>
                    <option value="seniors">👴 גיל השלישי (50+)</option>
                    <option value="businesses">🏢 עסקים וארגונים</option>
                    <option value="students">🎓 סטודנטים וצעירים (18-25)</option>
                  </select>
                </div>
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={analyzeVideo}
                  disabled={!campaignGoal || !targetAudience || isAnalyzing}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                      מנתח בינה מלאכותית...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>✨</span>
                      הפעל ניתוח AI מתקדם
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-purple-500/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span>🎬</span>
                תצוגה מקדימה
              </h3>
              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-purple-500/30">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  controls
                />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-gray-400">הוידאו מוכן לעיבוד ועריכה מתקדמת</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              🎬
            </div>
            <h1 className="text-2xl font-bold text-white">AI Video Studio Pro</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentStep('upload')}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              🆕 פרויקט חדש
            </button>
            <button
              onClick={exportVideo}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-2 rounded-lg font-semibold transition-all shadow-lg"
            >
              💾 ייצא פרויקט
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
          
          {/* Main Video Player */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-purple-500/30 mb-6">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  style={{
                    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />
                
                {showSubtitles && getCurrentSubtitle() && (
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-lg text-lg font-semibold backdrop-blur-sm">
                    {getCurrentSubtitle().text}
                  </div>
                )}
              </div>

              {/* Professional Controls */}
              <div className="bg-black/60 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg flex items-center justify-center text-xl transition-all"
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  
                  <button
                    onClick={() => seekTo(currentTime - 10)}
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center transition-all"
                  >
                    ⏪
                  </button>
                  
                  <button
                    onClick={() => seekTo(currentTime + 10)}
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center transition-all"
                  >
                    ⏩
                  </button>
                  
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-700 rounded-full h-2 relative cursor-pointer" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      seekTo(percent * duration);
                    }}>
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      >
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
                      </div>
                    </div>
                  </div>
                  
                  <span className="text-white font-mono text-sm bg-black/50 px-3 py-1 rounded">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">🔊 עוצמת קול</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white text-sm mb-2 block">⚡ מהירות</label>
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="w-full bg-black/50 border border-purple-500/30 rounded text-white p-1"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>
                  </div>
                  
                  <div>
                    <button
                      onClick={addCut}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      ✂️ חתוך כאן
                    </button>
                  </div>
                  
                  <div>
                    <button
                      onClick={applyAutoEdit}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      🤖 עריכה AI
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📽️</span>
                Timeline מקצועי
              </h3>
              
              <div className="bg-gray-900 rounded-xl p-4 min-h-32">
                <div className="flex items-center gap-2 mb-4">
                  {cuts.map((cut) => (
                    <div
                      key={cut.id}
                      onClick={() => applyCut(cut)}
                      className={`bg-gradient-to-r ${
                        cut.type === 'intro' ? 'from-green-500 to-emerald-500' :
                        cut.type === 'main' ? 'from-blue-500 to-purple-500' :
                        cut.type === 'outro' ? 'from-orange-500 to-red-500' :
                        'from-gray-500 to-gray-600'
                      } text-white px-4 py-2 rounded-lg cursor-pointer hover:scale-105 transition-all text-sm font-semibold relative group`}
                    >
                      {cut.label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCut(cut.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="text-gray-400 text-sm">
                  💡 לחץ על חיתוך כדי לצפות, לחץ על X כדי למחוק
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            
            {/* Filters */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎨</span>
                אפקטים ופילטרים
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">💡 בהירות</label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={filters.brightness}
                    onChange={(e) => setFilters({...filters, brightness: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-400 text-xs">{filters.brightness}%</span>
                </div>
                
                <div>
                  <label className="text-white text-sm mb-2 block">⚫ ניגודיות</label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={filters.contrast}
                    onChange={(e) => setFilters({...filters, contrast: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-400 text-xs">{filters.contrast}%</span>
                </div>
                
                <div>
                  <label className="text-white text-sm mb-2 block">🌈 רוויה</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.saturation}
                    onChange={(e) => setFilters({...filters, saturation: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-400 text-xs">{filters.saturation}%</span>
                </div>
                
                <div>
                  <label className="text-white text-sm mb-2 block">🌀 טשטוש</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={filters.blur}
                    onChange={(e) => setFilters({...filters, blur: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-400 text-xs">{filters.blur}px</span>
                </div>
              </div>
            </div>

            {/* Subtitles */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>💬</span>
                  כתוביות AI
                </h3>
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    showSubtitles 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {showSubtitles ? 'מוצג' : 'מוסתר'}
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {subtitles.map((subtitle, index) => (
                  <div
                    key={index}
                    onClick={() => seekTo(subtitle.start)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      getCurrentSubtitle() === subtitle
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="text-xs text-gray-400 mb-1">
                      {formatTime(subtitle.start)} - {formatTime(subtitle.end)}
                    </div>
                    <div className="text-white text-sm">{subtitle.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🧠</span>
                ניתוח AI מתקדם
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-green-300 text-sm mb-1">מצב רוח כללי</h4>
                  <p className="text-green-100 text-sm">אנרגטי, אופטימי ומעורר השראה</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-300 text-sm mb-2">רגשות מזוהים</h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-purple-500/30 text-purple-200 px-2 py-1 rounded text-xs">😊 שמחה</span>
                    <span className="bg-blue-500/30 text-blue-200 px-2 py-1 rounded text-xs">🤩 התרגשות</span>
                    <span className="bg-green-500/30 text-green-200 px-2 py-1 rounded text-xs">💪 ביטחון</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-orange-300 text-sm mb-1">המלצת קמפיין</h4>
                  <p className="text-orange-100 text-sm">מתאים מעולה לקמפיין מכירות עם דגש על תוצאות</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
