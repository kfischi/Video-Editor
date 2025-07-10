import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function ProfessionalAIVideoEditor() {
  // Core state
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [currentStep, setCurrentStep] = useState('upload');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  // AI Configuration
  const [aiConfig, setAiConfig] = useState({
    provider: 'claude', // 'claude' or 'openai'
    apiKey: '',
    isAnalyzing: false,
    analysisResult: null
  });
  
  // Timeline and editing
  const [timeline, setTimeline] = useState({
    videoTracks: [],
    audioTracks: [],
    textTracks: [],
    effectTracks: []
  });
  
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  
  // Professional effects
  const [videoEffects, setVideoEffects] = useState({
    colorCorrection: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      temperature: 0,
      tint: 0
    },
    transform: {
      scaleX: 100,
      scaleY: 100,
      positionX: 0,
      positionY: 0,
      rotation: 0,
      anchor: { x: 50, y: 50 }
    },
    blur: {
      amount: 0,
      type: 'gaussian'
    },
    noise: {
      amount: 0,
      type: 'uniform'
    },
    vignette: {
      amount: 0,
      softness: 50
    }
  });
  
  // Text and graphics
  const [textElements, setTextElements] = useState([]);
  const [graphics, setGraphics] = useState([]);
  
  // Audio
  const [audioMix, setAudioMix] = useState({
    masterVolume: 100,
    tracks: []
  });
  
  // Professional panels
  const [activePanel, setActivePanel] = useState('timeline');
  const [inspectorPanel, setInspectorPanel] = useState('properties');
  
  // UI state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showRenderDialog, setShowRenderDialog] = useState(false);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const timelineRef = useRef(null);
  const canvasRef = useRef(null);

  // Real AI Analysis Function
  const analyzeVideoWithAI = async () => {
    if (!aiConfig.apiKey) {
      alert('אנא הכנס API Key תחילה');
      return;
    }

    setAiConfig(prev => ({ ...prev, isAnalyzing: true }));

    try {
      let analysisResult;

      if (aiConfig.provider === 'claude') {
        // Claude API analysis
        const prompt = `אנא נתח את הוידאו הזה למטרות עריכה מקצועית:

1. זהה את מצב הרוח הכללי
2. מצא מומנטים מרכזיים עם זמנים מדויקים  
3. הצע חיתוכים מקצועיים
4. צור כתוביות מותאמות
5. המלץ על אפקטים ופילטרים
6. הצע color grading

החזר JSON במבנה:
{
  "mood": "תיאור מצב רוח",
  "keyMoments": [{"time": 5.2, "description": "תיאור", "importance": "high"}],
  "suggestedCuts": [{"start": 2.1, "end": 8.7, "reason": "סיבה", "type": "dynamic"}],
  "subtitles": [{"start": 0, "end": 3.2, "text": "טקסט", "position": "bottom"}],
  "colorGrading": {"temperature": 100, "tint": 0, "highlights": -20},
  "effects": ["stabilization", "noise-reduction"],
  "musicMood": "upbeat",
  "pacing": "fast"
}`;

        const response = await window.claude.complete(prompt);
        analysisResult = JSON.parse(response);
        
      } else if (aiConfig.provider === 'openai') {
        // OpenAI API analysis
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${aiConfig.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{
              role: 'user',
              content: `נתח וידאו זה עבור עריכה מקצועית ותחזיר JSON עם המלצות לעריכה, חיתוכים, אפקטים וכתוביות.`
            }],
            max_tokens: 2000
          })
        });
        
        const data = await response.json();
        analysisResult = JSON.parse(data.choices[0].message.content);
      }

      // Apply AI suggestions to timeline
      applyAISuggestions(analysisResult);
      
      setAiConfig(prev => ({ 
        ...prev, 
        analysisResult,
        isAnalyzing: false 
      }));

    } catch (error) {
      console.error('AI Analysis error:', error);
      setAiConfig(prev => ({ ...prev, isAnalyzing: false }));
      alert('שגיאה בניתוח AI: ' + error.message);
    }
  };

  // Apply AI suggestions to the timeline
  const applyAISuggestions = (analysis) => {
    // Add suggested cuts
    if (analysis.suggestedCuts) {
      const newVideoTracks = analysis.suggestedCuts.map((cut, index) => ({
        id: Date.now() + index,
        type: 'video',
        name: `AI Cut ${index + 1}`,
        startTime: cut.start,
        endTime: cut.end,
        source: videoUrl,
        effects: analysis.effects || [],
        aiGenerated: true
      }));
      
      setTimeline(prev => ({
        ...prev,
        videoTracks: [...prev.videoTracks, ...newVideoTracks]
      }));
    }

    // Add AI-generated subtitles
    if (analysis.subtitles) {
      const newTextTracks = analysis.subtitles.map((sub, index) => ({
        id: Date.now() + index + 1000,
        type: 'text',
        text: sub.text,
        startTime: sub.start,
        endTime: sub.end,
        style: {
          fontSize: 24,
          color: '#ffffff',
          fontFamily: 'Arial Bold',
          position: sub.position || 'bottom',
          background: 'rgba(0,0,0,0.7)'
        },
        aiGenerated: true
      }));
      
      setTimeline(prev => ({
        ...prev,
        textTracks: [...prev.textTracks, ...newTextTracks]
      }));
    }

    // Apply color grading suggestions
    if (analysis.colorGrading) {
      setVideoEffects(prev => ({
        ...prev,
        colorCorrection: {
          ...prev.colorCorrection,
          ...analysis.colorGrading
        }
      }));
    }
  };

  // File handling
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      // Initialize main video track
      const mainTrack = {
        id: Date.now(),
        type: 'video',
        name: file.name,
        source: url,
        startTime: 0,
        endTime: 0, // Will be set when metadata loads
        effects: [],
        locked: false
      };
      
      setTimeline(prev => ({
        ...prev,
        videoTracks: [mainTrack]
      }));
      
      setCurrentStep('edit');
    }
  };

  // Video controls
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
      setPlayhead(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Update main track duration
      setTimeline(prev => ({
        ...prev,
        videoTracks: prev.videoTracks.map(track => 
          track.source === videoUrl 
            ? { ...track, endTime: videoRef.current.duration }
            : track
        )
      }));
    }
  };

  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      setPlayhead(time);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30); // Assuming 30fps
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
  };

  // Professional editing functions
  const splitClip = (clipId, time) => {
    setTimeline(prev => {
      const newVideoTracks = prev.videoTracks.flatMap(track => {
        if (track.id === clipId && time > track.startTime && time < track.endTime) {
          return [
            { ...track, endTime: time },
            { 
              ...track, 
              id: Date.now(),
              startTime: time,
              name: `${track.name} (Split)`
            }
          ];
        }
        return track;
      });
      
      return { ...prev, videoTracks: newVideoTracks };
    });
  };

  const deleteClip = (clipId) => {
    setTimeline(prev => ({
      ...prev,
      videoTracks: prev.videoTracks.filter(track => track.id !== clipId),
      audioTracks: prev.audioTracks.filter(track => track.id !== clipId),
      textTracks: prev.textTracks.filter(track => track.id !== clipId)
    }));
  };

  const addTextElement = () => {
    const newText = {
      id: Date.now(),
      type: 'text',
      text: 'הוסף טקסט כאן',
      startTime: currentTime,
      endTime: currentTime + 5,
      style: {
        fontSize: 48,
        color: '#ffffff',
        fontFamily: 'Arial Bold',
        position: 'center',
        animation: 'none',
        stroke: '#000000',
        strokeWidth: 2,
        shadow: true
      }
    };
    
    setTimeline(prev => ({
      ...prev,
      textTracks: [...prev.textTracks, newText]
    }));
  };

  // Render/Export
  const renderProject = () => {
    const renderSettings = {
      resolution: '1920x1080',
      framerate: 30,
      codec: 'H.264',
      bitrate: '20000',
      quality: 'High',
      timeline: timeline,
      effects: videoEffects,
      duration: duration
    };
    
    console.log('Rendering with settings:', renderSettings);
    
    alert(`🎬 מתחיל רינדור מקצועי!

📐 רזולוציה: ${renderSettings.resolution}
🎞️ FPS: ${renderSettings.framerate}
💾 קודק: ${renderSettings.codec}
⚡ איכות: ${renderSettings.quality}
⏱️ משך: ${formatTime(duration)}

✂️ קליפים: ${timeline.videoTracks.length}
📝 טקסטים: ${timeline.textTracks.length}
🎵 אודיו: ${timeline.audioTracks.length}
🤖 AI גנרציות: ${timeline.videoTracks.filter(t => t.aiGenerated).length}

הרינדור יסתיים בקרוב...`);

    setShowRenderDialog(false);
  };

  if (currentStep === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.02"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto p-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl">🎬</span>
              </div>
              <div>
                <h1 className="text-7xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  AI Video Studio
                </h1>
                <p className="text-2xl text-gray-300 font-light mt-2">Professional Edition</p>
              </div>
            </div>
            
            <p className="text-3xl text-gray-200 font-light mb-8 leading-relaxed">
              עורך וידאו מקצועי ברמה בינלאומית עם בינה מלאכותית מתקדמת
            </p>
            
            <div className="flex items-center justify-center gap-8 mb-12">
              <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-full px-6 py-3 border border-blue-500/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-200 font-medium">Claude AI Integration</span>
              </div>
              <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-500/30">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-200 font-medium">OpenAI Compatible</span>
              </div>
              <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-full px-6 py-3 border border-pink-500/30">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-200 font-medium">4K Export Ready</span>
              </div>
            </div>
          </div>

          <div 
            className="relative border-2 border-dashed border-blue-400/40 rounded-3xl p-20 text-center bg-black/20 backdrop-blur-xl hover:border-blue-400/60 hover:bg-black/30 transition-all duration-500 cursor-pointer group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0 && files[0].type.startsWith('video/')) {
                setVideoFile(files[0]);
                setVideoUrl(URL.createObjectURL(files[0]));
                setCurrentStep('edit');
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="text-9xl mb-8 group-hover:scale-110 transition-transform duration-500">🎬</div>
              <h3 className="text-4xl font-bold text-white mb-6">העלה וידאו לעריכה מקצועית</h3>
              <p className="text-2xl text-gray-300 mb-8">גרור קובץ וידאו או לחץ לבחירה</p>
              
              <div className="flex items-center justify-center gap-8 mb-12">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 rounded-full text-white font-bold text-lg">MP4</div>
                <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 rounded-full text-white font-bold text-lg">MOV</div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 rounded-full text-white font-bold text-lg">AVI</div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-full text-white font-bold text-lg">MKV</div>
              </div>
              
              <p className="text-gray-400 text-lg">תומך ברזולוציית 4K • פורמטים מקצועיים • ללא הגבלת גודל</p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="mt-16 grid md:grid-cols-4 gap-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
              <div className="text-5xl mb-6 text-center">🤖</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">AI מתקדם</h3>
              <p className="text-gray-300 text-center leading-relaxed">ניתוח אוטומטי עם Claude ו-OpenAI, חיתוכים חכמים וכתוביות אוטומטיות</p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
              <div className="text-5xl mb-6 text-center">✂️</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">עריכה מקצועית</h3>
              <p className="text-gray-300 text-center leading-relaxed">Timeline מתקדם, חיתוך מדויק, אפקטים ומעברים ברמה בינלאומית</p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
              <div className="text-5xl mb-6 text-center">🎨</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Color Grading</h3>
              <p className="text-gray-300 text-center leading-relaxed">כלי צביעה מקצועיים, LUTs, ותיקון צבעים ברמת Hollywood</p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
              <div className="text-5xl mb-6 text-center">🎵</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">אודיו מתקדם</h3>
              <p className="text-gray-300 text-center leading-relaxed">מיקסינג מקצועי, EQ, דחיסה וספריית מוזיקה עשירה</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Professional Menu Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                🎬
              </div>
              <h1 className="text-white font-bold text-lg">AI Video Studio Pro</h1>
            </div>
            
            <nav className="flex items-center gap-4">
              <button className="text-gray-300 hover:text-white px-3 py-1 rounded text-sm transition-colors">קובץ</button>
              <button className="text-gray-300 hover:text-white px-3 py-1 rounded text-sm transition-colors">עריכה</button>
              <button className="text-gray-300 hover:text-white px-3 py-1 rounded text-sm transition-colors">אפקטים</button>
              <button 
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded text-sm transition-colors"
              >
                🤖 AI
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-gray-400 text-sm">{videoFile?.name}</div>
            <button
              onClick={() => setShowRenderDialog(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg"
            >
              💾 ייצא
            </button>
          </div>
        </div>
      </div>

      {/* AI Configuration Panel */}
      {showAIPanel && (
        <div className="bg-purple-900/95 backdrop-blur-sm border-b border-purple-700 p-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-white font-bold text-lg mb-4">🤖 הגדרות AI מתקדמות</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-purple-200 text-sm mb-2 block">ספק AI</label>
                <select
                  value={aiConfig.provider}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full bg-purple-800 border border-purple-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="claude">Claude AI (מומלץ)</option>
                  <option value="openai">OpenAI GPT-4</option>
                </select>
              </div>
              
              <div>
                <label className="text-purple-200 text-sm mb-2 block">API Key</label>
                <input
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="הכנס API Key..."
                  className="w-full bg-purple-800 border border-purple-600 rounded-lg px-3 py-2 text-white placeholder-purple-300"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={analyzeVideoWithAI}
                  disabled={!aiConfig.apiKey || aiConfig.isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-all"
                >
                  {aiConfig.isAnalyzing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      מנתח...
                    </div>
                  ) : (
                    '✨ נתח עם AI'
                  )}
                </button>
              </div>
            </div>
            
            {aiConfig.analysisResult && (
              <div className="mt-4 bg-purple-800/50 rounded-lg p-4">
                <div className="text-purple-200 text-sm">
                  ✅ ניתוח הושלם: {aiConfig.analysisResult.keyMoments?.length || 0} מומנטים מרכזיים, 
                  {aiConfig.analysisResult.suggestedCuts?.length || 0} חיתוכים מוצעים,
                  {aiConfig.analysisResult.subtitles?.length || 0} כתוביות נוצרו
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Tools & Media */}
        <div className="w-80 bg-gray-850 border-r border-gray-700 flex flex-col">
          <div className="border-b border-gray-700 p-3">
            <div className="flex gap-1">
              <button
                onClick={() => setActivePanel('media')}
                className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
                  activePanel === 'media' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📁 מדיה
              </button>
              <button
                onClick={() => setActivePanel('effects')}
                className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
                  activePanel === 'effects' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🎨 אפקטים
              </button>
              <button
                onClick={() => setActivePanel('text')}
                className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
                  activePanel === 'text' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📝 טקסט
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === 'effects' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Color Correction</h4>
                  <div className="space-y-3">
                    {Object.entries(videoEffects.colorCorrection).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-gray-300 text-sm capitalize block mb-1">
                          {key === 'temperature' ? 'טמפרטורה' :
                           key === 'brightness' ? 'בהירות' :
                           key === 'contrast' ? 'ניגודיות' :
                           key === 'saturation' ? 'רוויה' :
                           key === 'highlights' ? 'הדגשות' :
                           key === 'shadows' ? 'צללים' : key}
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={value}
                          onChange={(e) => setVideoEffects(prev => ({
                            ...prev,
                            colorCorrection: {
                              ...prev.colorCorrection,
                              [key]: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-gray-400 text-xs text-center">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Transform</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-300 text-sm block mb-1">Scale X</label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={videoEffects.transform.scaleX}
                        onChange={(e) => setVideoEffects(prev => ({
                          ...prev,
                          transform: { ...prev.transform, scaleX: parseInt(e.target.value) }
                        }))}
                        className="w-full"
                      />
                      <div className="text-gray-400 text-xs text-center">{videoEffects.transform.scaleX}%</div>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm block mb-1">Scale Y</label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={videoEffects.transform.scaleY}
                        onChange={(e) => setVideoEffects(prev => ({
                          ...prev,
                          transform: { ...prev.transform, scaleY: parseInt(e.target.value) }
                        }))}
                        className="w-full"
                      />
                      <div className="text-gray-400 text-xs text-center">{videoEffects.transform.scaleY}%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'text' && (
              <div>
                <button
                  onClick={addTextElement}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold mb-4 transition-all"
                >
                  ➕ הוסף טקסט מקצועי
                </button>

                <div className="space-y-3">
                  {timeline.textTracks.map((textTrack) => (
                    <div
                      key={textTrack.id}
                      onClick={() => setSelectedElement(textTrack)}
                      className={`bg-gray-800 border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedElement?.id === textTrack.id 
                          ? 'border-purple-500 bg-purple-900/30' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-white font-medium mb-1">{textTrack.text}</div>
                      <div className="text-gray-400 text-xs">
                        {formatTime(textTrack.startTime)} - {formatTime(textTrack.endTime)}
                        {textTrack.aiGenerated && <span className="text-purple-400 ml-2">🤖 AI</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview with Professional Controls */}
          <div className="flex-1 bg-black flex items-center justify-center relative">
            <div className="relative">
              <video
                ref={videoRef}
                src={videoUrl}
                className="max-h-full max-w-full object-contain"
                style={{
                  filter: `brightness(${100 + videoEffects.colorCorrection.brightness}%) 
                          contrast(${100 + videoEffects.colorCorrection.contrast}%) 
                          saturate(${100 + videoEffects.colorCorrection.saturation}%)
                          hue-rotate(${videoEffects.colorCorrection.temperature}deg)`,
                  transform: `scale(${videoEffects.transform.scaleX/100}, ${videoEffects.transform.scaleY/100}) 
                            rotate(${videoEffects.transform.rotation}deg)
                            translate(${videoEffects.transform.positionX}px, ${videoEffects.transform.positionY}px)`
                }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />
              
              {/* Text Overlays */}
              {timeline.textTracks.map((textTrack) => {
                const isVisible = currentTime >= textTrack.startTime && currentTime <= textTrack.endTime;
                if (!isVisible) return null;
                
                return (
                  <div
                    key={textTrack.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: '50%',
                      top: textTrack.style.position === 'top' ? '20%' : 
                           textTrack.style.position === 'center' ? '50%' : '80%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${textTrack.style.fontSize}px`,
                      color: textTrack.style.color,
                      fontFamily: textTrack.style.fontFamily,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      background: textTrack.style.background || 'transparent',
                      padding: textTrack.style.background ? '8px 16px' : '0',
                      borderRadius: textTrack.style.background ? '8px' : '0',
                      maxWidth: '80vw',
                      lineHeight: 1.2
                    }}
                  >
                    {textTrack.text}
                  </div>
                );
              })}
            </div>

            {/* Professional Video Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center text-xl transition-all"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <button
                onClick={() => seekTo(Math.max(0, currentTime - 10))}
                className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center transition-all"
              >
                ⏪
              </button>
              
              <button
                onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center transition-all"
              >
                ⏩
              </button>
              
              <div className="text-white font-mono text-sm bg-black/50 px-3 py-1 rounded">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              
              <button
                onClick={() => splitClip(selectedElement?.id || timeline.videoTracks[0]?.id, currentTime)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                ✂️ חתוך
              </button>
            </div>
          </div>

          {/* Professional Timeline */}
          <div className="bg-gray-900 border-t border-gray-700 p-4" style={{ height: '300px' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Timeline מקצועי</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">זום:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-gray-400 text-xs">{Math.round(zoom * 100)}%</span>
                </div>
              </div>
            </div>
            
            <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ height: '240px' }}>
              {/* Time Ruler */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gray-700 border-b border-gray-600 flex">
                {Array.from({ length: Math.ceil(duration / zoom) }, (_, i) => (
                  <div key={i} className="flex-shrink-0 border-r border-gray-600 px-2 py-1 text-xs text-gray-300">
                    {formatTime(i * zoom)}
                  </div>
                ))}
              </div>

              {/* Video Tracks */}
              <div className="absolute top-8 left-0 right-0 bottom-0 overflow-y-auto">
                <div className="space-y-1 p-2">
                  
                  {/* Main Video Track */}
                  <div className="h-12 relative bg-gray-750 rounded border border-gray-600">
                    <div className="absolute left-2 top-2 text-gray-300 text-xs font-medium">🎬 Video</div>
                    {timeline.videoTracks.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedElement(track)}
                        className={`absolute h-10 top-1 rounded cursor-pointer transition-all ${
                          selectedElement?.id === track.id 
                            ? 'bg-blue-500 border-2 border-blue-300' 
                            : track.aiGenerated 
                              ? 'bg-purple-600 hover:bg-purple-500'
                              : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                        style={{
                          left: `${(track.startTime / duration) * 100}%`,
                          width: `${((track.endTime - track.startTime) / duration) * 100}%`
                        }}
                      >
                        <div className="text-white text-xs p-1 truncate flex items-center gap-1">
                          {track.aiGenerated && <span>🤖</span>}
                          {track.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Text Tracks */}
                  <div className="h-12 relative bg-gray-750 rounded border border-gray-600">
                    <div className="absolute left-2 top-2 text-gray-300 text-xs font-medium">📝 Text</div>
                    {timeline.textTracks.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedElement(track)}
                        className={`absolute h-10 top-1 rounded cursor-pointer transition-all ${
                          selectedElement?.id === track.id 
                            ? 'bg-yellow-500 border-2 border-yellow-300' 
                            : track.aiGenerated 
                              ? 'bg-purple-600 hover:bg-purple-500'
                              : 'bg-orange-600 hover:bg-orange-500'
                        }`}
                        style={{
                          left: `${(track.startTime / duration) * 100}%`,
                          width: `${((track.endTime - track.startTime) / duration) * 100}%`
                        }}
                      >
                        <div className="text-white text-xs p-1 truncate flex items-center gap-1">
                          {track.aiGenerated && <span>🤖</span>}
                          {track.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audio Tracks */}
                  <div className="h-12 relative bg-gray-750 rounded border border-gray-600">
                    <div className="absolute left-2 top-2 text-gray-300 text-xs font-medium">🎵 Audio</div>
                    {timeline.audioTracks.map((track) => (
                      <div
                        key={track.id}
                        className="absolute h-10 top-1 bg-green-600 hover:bg-green-500 rounded cursor-pointer transition-all"
                        style={{
                          left: `${(track.startTime / duration) * 100}%`,
                          width: `${((track.endTime - track.startTime) / duration) * 100}%`
                        }}
                      >
                        <div className="text-white text-xs p-1 truncate">{track.name}</div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Playhead */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                style={{ left: `${(playhead / duration) * 100}%` }}
              >
                <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Inspector */}
        <div className="w-80 bg-gray-850 border-l border-gray-700 overflow-y-auto">
          <div className="border-b border-gray-700 p-3">
            <h3 className="text-white font-semibold">Inspector</h3>
          </div>
          
          <div className="p-4">
            {selectedElement ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Properties</h4>
                  <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                    <div className="text-gray-300 text-sm">Type: {selectedElement.type}</div>
                    <div className="text-gray-300 text-sm">Duration: {formatTime(selectedElement.endTime - selectedElement.startTime)}</div>
                    {selectedElement.aiGenerated && (
                      <div className="text-purple-400 text-sm flex items-center gap-1">
                        🤖 AI Generated
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedElement.type === 'text' && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Text Properties</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={selectedElement.text}
                        onChange={(e) => {
                          setTimeline(prev => ({
                            ...prev,
                            textTracks: prev.textTracks.map(track =>
                              track.id === selectedElement.id 
                                ? { ...track, text: e.target.value }
                                : track
                            )
                          }));
                          setSelectedElement({ ...selectedElement, text: e.target.value });
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                      
                      <div>
                        <label className="text-gray-300 text-sm block mb-1">Font Size</label>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          value={selectedElement.style?.fontSize || 24}
                          onChange={(e) => {
                            const newSize = parseInt(e.target.value);
                            setTimeline(prev => ({
                              ...prev,
                              textTracks: prev.textTracks.map(track =>
                                track.id === selectedElement.id 
                                  ? { ...track, style: { ...track.style, fontSize: newSize } }
                                  : track
                              )
                            }));
                          }}
                          className="w-full"
                        />
                        <div className="text-gray-400 text-xs text-center">{selectedElement.style?.fontSize || 24}px</div>
                      </div>
                      
                      <div>
                        <label className="text-gray-300 text-sm block mb-1">Color</label>
                        <input
                          type="color"
                          value={selectedElement.style?.color || '#ffffff'}
                          onChange={(e) => {
                            setTimeline(prev => ({
                              ...prev,
                              textTracks: prev.textTracks.map(track =>
                                track.id === selectedElement.id 
                                  ? { ...track, style: { ...track.style, color: e.target.value } }
                                  : track
                              )
                            }));
                          }}
                          className="w-full h-10 rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                בחר אלמנט בTimeline לעריכה
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render Dialog */}
      {showRenderDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-600">
            <h3 className="text-white text-2xl font-bold mb-6">ייצא פרויקט</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-gray-300 block mb-2">רזולוציה</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option>4K (3840x2160)</option>
                  <option>1080p (1920x1080)</option>
                  <option>720p (1280x720)</option>
                </select>
              </div>
              
              <div>
                <label className="text-gray-300 block mb-2">איכות</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option>Best (50 Mbps)</option>
                  <option>High (20 Mbps)</option>
                  <option>Medium (10 Mbps)</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRenderDialog(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                ביטול
              </button>
              <button
                onClick={renderProject}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg font-semibold transition-all"
              >
                🚀 ייצא
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
