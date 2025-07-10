import React, { useState, useRef, useEffect } from 'react';

export default function CapCutStyleEditor() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [currentStep, setCurrentStep] = useState('upload');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  
  // Timeline and editing
  const [timeline, setTimeline] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [draggedClip, setDraggedClip] = useState(null);
  const [splitPoints, setSplitPoints] = useState([]);
  
  // Effects and filters
  const [activeFilters, setActiveFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0,
    sharpen: 0
  });
  
  // Text and overlays
  const [textLayers, setTextLayers] = useState([]);
  const [selectedTextLayer, setSelectedTextLayer] = useState(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  
  // Audio
  const [audioTracks, setAudioTracks] = useState([]);
  const [musicLibrary, setMusicLibrary] = useState([
    { id: 1, name: "Upbeat Corporate", category: "business", duration: 180 },
    { id: 2, name: "Chill Vibes", category: "lifestyle", duration: 120 },
    { id: 3, name: "Epic Trailer", category: "dramatic", duration: 90 }
  ]);
  
  // Transitions
  const [transitions, setTransitions] = useState([]);
  const [availableTransitions] = useState([
    { id: 'fade', name: 'Fade', icon: '🌅' },
    { id: 'slide', name: 'Slide', icon: '➡️' },
    { id: 'zoom', name: 'Zoom', icon: '🔍' },
    { id: 'dissolve', name: 'Dissolve', icon: '✨' },
    { id: 'wipe', name: 'Wipe', icon: '🧹' }
  ]);
  
  // Effects library
  const [effectsLibrary] = useState([
    { id: 1, name: "Vintage Film", category: "retro", preview: "🎞️" },
    { id: 2, name: "Neon Glow", category: "modern", preview: "💫" },
    { id: 3, name: "Cinematic", category: "professional", preview: "🎬" },
    { id: 4, name: "Glitch", category: "tech", preview: "📺" },
    { id: 5, name: "Bokeh", category: "artistic", preview: "✨" },
    { id: 6, name: "Film Grain", category: "retro", preview: "🌪️" }
  ]);
  
  // Active panel
  const [activePanel, setActivePanel] = useState('timeline');
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const timelineRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      // Initialize timeline with the main video clip
      const mainClip = {
        id: Date.now(),
        type: 'video',
        name: file.name,
        url: url,
        startTime: 0,
        endTime: 0, // Will be set when metadata loads
        x: 0,
        width: 100, // Percentage of timeline
        track: 0
      };
      
      setTimeline([mainClip]);
      setCurrentStep('edit');
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
        
        const mainClip = {
          id: Date.now(),
          type: 'video',
          name: file.name,
          url: url,
          startTime: 0,
          endTime: 0,
          x: 0,
          width: 100,
          track: 0
        };
        
        setTimeline([mainClip]);
        setCurrentStep('edit');
      }
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
      // Update the main clip duration
      setTimeline(prev => prev.map(clip => 
        clip.type === 'video' ? { ...clip, endTime: videoRef.current.duration } : clip
      ));
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

  // Split video at current time
  const splitAtCurrentTime = () => {
    if (!selectedClip || selectedClip.type !== 'video') return;
    
    const splitTime = currentTime;
    if (splitTime <= selectedClip.startTime || splitTime >= selectedClip.endTime) return;
    
    const newClips = timeline.map(clip => {
      if (clip.id === selectedClip.id) {
        // Create two clips from the split
        const firstClip = {
          ...clip,
          endTime: splitTime,
          width: ((splitTime - clip.startTime) / (clip.endTime - clip.startTime)) * clip.width
        };
        
        const secondClip = {
          ...clip,
          id: Date.now(),
          startTime: splitTime,
          x: clip.x + firstClip.width,
          width: clip.width - firstClip.width
        };
        
        return [firstClip, secondClip];
      }
      return clip;
    }).flat();
    
    setTimeline(newClips);
    setSplitPoints([...splitPoints, splitTime]);
  };

  // Add text layer
  const addTextLayer = () => {
    const newTextLayer = {
      id: Date.now(),
      text: 'Add your text here',
      x: 50, // Percentage from left
      y: 50, // Percentage from top
      fontSize: 24,
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      startTime: currentTime,
      endTime: currentTime + 3,
      animation: 'none'
    };
    
    setTextLayers([...textLayers, newTextLayer]);
    setSelectedTextLayer(newTextLayer);
    setShowTextEditor(true);
  };

  // Add transition between clips
  const addTransition = (transitionType, clipIndex) => {
    const newTransition = {
      id: Date.now(),
      type: transitionType,
      position: clipIndex,
      duration: 1.0
    };
    
    setTransitions([...transitions, newTransition]);
  };

  // Apply effect to selected clip
  const applyEffect = (effect) => {
    if (!selectedClip) return;
    
    const updatedTimeline = timeline.map(clip => 
      clip.id === selectedClip.id 
        ? { ...clip, effect: effect.id, effectName: effect.name }
        : clip
    );
    
    setTimeline(updatedTimeline);
  };

  // Add music track
  const addMusicTrack = (music) => {
    const newAudioTrack = {
      id: Date.now(),
      name: music.name,
      startTime: 0,
      endTime: music.duration,
      volume: 0.5,
      track: audioTracks.length + 1
    };
    
    setAudioTracks([...audioTracks, newAudioTrack]);
  };

  // Export project
  const exportProject = () => {
    const exportData = {
      video: {
        file: videoFile?.name,
        duration: duration,
        filters: activeFilters
      },
      timeline: timeline,
      textLayers: textLayers,
      audioTracks: audioTracks,
      transitions: transitions,
      splitPoints: splitPoints
    };
    
    console.log('Export data:', exportData);
    
    alert(`🎬 מייצא פרויקט מקצועי!

📹 וידאו: ${videoFile?.name}
✂️ חיתוכים: ${splitPoints.length}
📝 טקסטים: ${textLayers.length}
🎵 מוזיקה: ${audioTracks.length}
🌟 אפקטים: ${timeline.filter(c => c.effect).length}
🔀 מעברים: ${transitions.length}

יייצא כקובץ MP4 מקצועי!`);
  };

  if (currentStep === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-3xl">✂️</span>
              </div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                ProCut Editor
              </h1>
            </div>
            <p className="text-2xl text-gray-300 font-light mb-4">
              עורך וידאו מקצועי בסגנון CapCut עם כלי עריכה מתקדמים
            </p>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 max-w-2xl mx-auto">
              <p className="text-green-200 font-semibold">🔥 כלי עריכה מקצועיים!</p>
              <p className="text-green-300 text-sm">חיתוך, אפקטים, טקסט, מוזיקה, מעברים ועוד</p>
            </div>
          </div>

          <div 
            className="relative border-2 border-dashed border-purple-400/50 rounded-2xl p-16 text-center bg-black/20 backdrop-blur-sm hover:border-purple-400 hover:bg-black/30 transition-all duration-300 cursor-pointer group"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative z-10">
              <div className="text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">🎬</div>
              <h3 className="text-3xl font-bold text-white mb-4">התחל עריכה מקצועית</h3>
              <p className="text-xl text-gray-300 mb-6">גרור וידאו או לחץ לבחירה</p>
              
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-full text-white font-semibold">MP4</div>
                <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-2 rounded-full text-white font-semibold">MOV</div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full text-white font-semibold">AVI</div>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full text-white font-semibold">MKV</div>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="mt-12 grid md:grid-cols-4 gap-6 text-center">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl mb-4">✂️</div>
              <h3 className="text-xl font-bold text-white mb-2">חיתוך מדויק</h3>
              <p className="text-gray-400">חתוך, פצל וערוך בקלות עם timeline מקצועי</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-white mb-2">אפקטים ופילטרים</h3>
              <p className="text-gray-400">ספריית אפקטים עשירה לכל סגנון</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">טקסט ואנימציות</h3>
              <p className="text-gray-400">הוסף כותרות וטקסטים מעוצבים</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-bold text-white mb-2">מוזיקה ואודיו</h3>
              <p className="text-gray-400">ספריית מוזיקה וכלי עריכת אודיו</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header Toolbar */}
      <div className="bg-gray-900 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                ✂️
              </div>
              <h1 className="text-white font-bold text-lg">ProCut Editor</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep('upload')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-all"
              >
                📁 פתח קובץ
              </button>
              <button
                onClick={exportProject}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded font-semibold text-sm transition-all"
              >
                💾 ייצא
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{videoFile?.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">זום:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-gray-400 text-xs">{Math.round(zoom * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-gray-900 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActivePanel('effects')}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
                  activePanel === 'effects' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🎨 אפקטים
              </button>
              <button
                onClick={() => setActivePanel('text')}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
                  activePanel === 'text' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📝 טקסט
              </button>
              <button
                onClick={() => setActivePanel('music')}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
                  activePanel === 'music' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🎵 מוזיקה
              </button>
            </div>

            {/* Effects Panel */}
            {activePanel === 'effects' && (
              <div>
                <h3 className="text-white font-semibold mb-3">אפקטים ופילטרים</h3>
                
                <div className="mb-6">
                  <h4 className="text-gray-300 text-sm mb-2">בקרי צבע</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-xs">בהירות</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={activeFilters.brightness}
                        onChange={(e) => setActiveFilters({...activeFilters, brightness: parseInt(e.target.value)})}
                        className="w-full"
                      />
                      <span className="text-gray-500 text-xs">{activeFilters.brightness}%</span>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-xs">ניגודיות</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={activeFilters.contrast}
                        onChange={(e) => setActiveFilters({...activeFilters, contrast: parseInt(e.target.value)})}
                        className="w-full"
                      />
                      <span className="text-gray-500 text-xs">{activeFilters.contrast}%</span>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-xs">רוויה</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={activeFilters.saturation}
                        onChange={(e) => setActiveFilters({...activeFilters, saturation: parseInt(e.target.value)})}
                        className="w-full"
                      />
                      <span className="text-gray-500 text-xs">{activeFilters.saturation}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-gray-300 text-sm mb-3">ספריית אפקטים</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {effectsLibrary.map((effect) => (
                      <button
                        key={effect.id}
                        onClick={() => applyEffect(effect)}
                        className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 text-center transition-all group"
                      >
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                          {effect.preview}
                        </div>
                        <div className="text-white text-xs font-medium">{effect.name}</div>
                        <div className="text-gray-400 text-xs">{effect.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Text Panel */}
            {activePanel === 'text' && (
              <div>
                <h3 className="text-white font-semibold mb-3">כלי טקסט</h3>
                
                <button
                  onClick={addTextLayer}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold mb-4 transition-all"
                >
                  ➕ הוסף טקסט
                </button>

                <div className="space-y-3">
                  {textLayers.map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedTextLayer(layer)}
                      className={`bg-gray-800 border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedTextLayer?.id === layer.id 
                          ? 'border-purple-500 bg-purple-900/30' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-white text-sm font-medium mb-1">{layer.text}</div>
                      <div className="text-gray-400 text-xs">
                        {formatTime(layer.startTime)} - {formatTime(layer.endTime)}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTextLayer && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                    <h4 className="text-white text-sm font-medium mb-2">עריכת טקסט</h4>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={selectedTextLayer.text}
                        onChange={(e) => {
                          const updatedLayers = textLayers.map(layer =>
                            layer.id === selectedTextLayer.id 
                              ? { ...layer, text: e.target.value }
                              : layer
                          );
                          setTextLayers(updatedLayers);
                          setSelectedTextLayer({ ...selectedTextLayer, text: e.target.value });
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                        placeholder="הקלד טקסט..."
                      />
                      
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedTextLayer.color}
                          onChange={(e) => {
                            const updatedLayers = textLayers.map(layer =>
                              layer.id === selectedTextLayer.id 
                                ? { ...layer, color: e.target.value }
                                : layer
                            );
                            setTextLayers(updatedLayers);
                            setSelectedTextLayer({ ...selectedTextLayer, color: e.target.value });
                          }}
                          className="w-8 h-8 rounded"
                        />
                        
                        <select
                          value={selectedTextLayer.fontSize}
                          onChange={(e) => {
                            const updatedLayers = textLayers.map(layer =>
                              layer.id === selectedTextLayer.id 
                                ? { ...layer, fontSize: parseInt(e.target.value) }
                                : layer
                            );
                            setTextLayers(updatedLayers);
                            setSelectedTextLayer({ ...selectedTextLayer, fontSize: parseInt(e.target.value) });
                          }}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        >
                          <option value={16}>קטן</option>
                          <option value={24}>בינוני</option>
                          <option value={32}>גדול</option>
                          <option value={48}>ענק</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Music Panel */}
            {activePanel === 'music' && (
              <div>
                <h3 className="text-white font-semibold mb-3">ספריית מוזיקה</h3>
                
                <div className="space-y-2">
                  {musicLibrary.map((music) => (
                    <div key={music.id} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white text-sm font-medium">{music.name}</div>
                        <button
                          onClick={() => addMusicTrack(music)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition-all"
                        >
                          ➕ הוסף
                        </button>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {music.category} • {Math.floor(music.duration / 60)}:{(music.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>

                {audioTracks.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white text-sm font-medium mb-2">רצועות אודיו</h4>
                    <div className="space-y-2">
                      {audioTracks.map((track) => (
                        <div key={track.id} className="bg-gray-800 border border-gray-600 rounded-lg p-2">
                          <div className="text-white text-sm">{track.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-400 text-xs">עוצמה:</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={track.volume}
                              onChange={(e) => {
                                const updatedTracks = audioTracks.map(t =>
                                  t.id === track.id ? { ...t, volume: parseFloat(e.target.value) } : t
                                );
                                setAudioTracks(updatedTracks);
                              }}
                              className="flex-1"
                            />
                            <span className="text-gray-400 text-xs">{Math.round(track.volume * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <div className="flex-1 bg-gray-800 flex items-center justify-center">
            <div className="relative">
              <video
                ref={videoRef}
                src={videoUrl}
                className="max-h-96 max-w-full object-contain"
                style={{
                  filter: `brightness(${activeFilters.brightness}%) contrast(${activeFilters.contrast}%) saturate(${activeFilters.saturation}%) blur(${activeFilters.blur}px) hue-rotate(${activeFilters.hue}deg)`
                }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />
              
              {/* Text overlays */}
              {textLayers.map((layer) => {
                const isVisible = currentTime >= layer.startTime && currentTime <= layer.endTime;
                if (!isVisible) return null;
                
                return (
                  <div
                    key={layer.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      fontSize: `${layer.fontSize}px`,
                      color: layer.color,
                      fontFamily: layer.fontFamily,
                      fontWeight: layer.fontWeight,
                      transform: 'translate(-50%, -50%)',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    {layer.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Video Controls */}
          <div className="bg-gray-900 border-t border-gray-700 p-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center text-xl transition-all"
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
              
              <div className="flex-1 mx-4">
                <div className="bg-gray-700 rounded-full h-2 relative cursor-pointer" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  seekTo(percent * duration);
                }}>
                  <div 
                    className="bg-purple-600 h-2 rounded-full relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
                  </div>
                </div>
              </div>
              
              <span className="text-white font-mono text-sm bg-gray-800 px-3 py-1 rounded">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              
              <button
                onClick={splitAtCurrentTime}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                ✂️ חתוך
              </button>
            </div>
          </div>

          {/* Timeline Area */}
          <div className="bg-gray-950 border-t border-gray-700 p-4" style={{ height: '200px' }}>
            <h3 className="text-white font-semibold mb-3">Timeline</h3>
            
            <div className="relative bg-gray-800 rounded-lg h-32 overflow-hidden">
              {/* Time ruler */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gray-700 border-b border-gray-600">
                <div className="flex items-center h-full px-2">
                  {Array.from({ length: Math.ceil(duration / 5) }, (_, i) => (
                    <div key={i} className="flex-1 text-xs text-gray-400 border-r border-gray-600 pr-1">
                      {formatTime(i * 5)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Video tracks */}
              <div className="absolute top-6 left-0 right-0 bottom-0">
                {/* Main video track */}
                <div className="h-8 relative border-b border-gray-600">
                  {timeline.filter(clip => clip.type === 'video').map((clip) => (
                    <div
                      key={clip.id}
                      onClick={() => setSelectedClip(clip)}
                      className={`absolute h-7 rounded cursor-pointer transition-all ${
                        selectedClip?.id === clip.id 
                          ? 'bg-purple-600 border-2 border-purple-400' 
                          : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                      style={{
                        left: `${(clip.startTime / duration) * 100}%`,
                        width: `${((clip.endTime - clip.startTime) / duration) * 100}%`
                      }}
                    >
                      <div className="text-white text-xs p-1 truncate">
                        {clip.name} {clip.effect && `(${clip.effectName})`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Audio tracks */}
                {audioTracks.map((track, index) => (
                  <div key={track.id} className="h-6 relative border-b border-gray-600">
                    <div
                      className="absolute h-5 bg-green-600 rounded cursor-pointer"
                      style={{
                        left: `${(track.startTime / duration) * 100}%`,
                        width: `${((track.endTime - track.startTime) / duration) * 100}%`
                      }}
                    >
                      <div className="text-white text-xs p-1 truncate">
                        🎵 {track.name}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Text tracks */}
                {textLayers.map((layer) => (
                  <div key={layer.id} className="h-6 relative border-b border-gray-600">
                    <div
                      onClick={() => setSelectedTextLayer(layer)}
                      className={`absolute h-5 rounded cursor-pointer transition-all ${
                        selectedTextLayer?.id === layer.id 
                          ? 'bg-yellow-600 border border-yellow-400' 
                          : 'bg-orange-600 hover:bg-orange-500'
                      }`}
                      style={{
                        left: `${(layer.startTime / duration) * 100}%`,
                        width: `${((layer.endTime - layer.startTime) / duration) * 100}%`
                      }}
                    >
                      <div className="text-white text-xs p-1 truncate">
                        📝 {layer.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Playhead */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
