import React, { useState } from 'react';
import { Video, Play, Download, Loader, Sparkles, Clock, Film, ArrowLeft, LogIn, UserPlus, User, LogOut } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface VideoGeneratorProps {
  onBackToChat?: () => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onBackToChat }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<any[]>([]);
  const [videoHistory, setVideoHistory] = useState<any[]>([]);
  const [duration, setDuration] = useState('5');
  const [style, setStyle] = useState('realistic');
  const [user, setUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const navigate = useNavigate();

  // Monitor authentication state
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const docRef = doc(db, "Users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserDetails(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load history from localStorage on component mount
  React.useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`ai-video-history-${user.uid}`);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory).map((vid: any) => ({
          ...vid,
          timestamp: new Date(vid.timestamp)
        }));
        setVideoHistory(parsedHistory);
      }
    } else {
      const savedHistory = localStorage.getItem('ai-video-history-guest');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory).map((vid: any) => ({
          ...vid,
          timestamp: new Date(vid.timestamp)
        }));
        setVideoHistory(parsedHistory);
      }
    }
  }, [user]);

  // Save history to localStorage whenever it changes
  React.useEffect(() => {
    if (videoHistory.length > 0) {
      const storageKey = user 
        ? `ai-video-history-${user.uid}` 
        : 'ai-video-history-guest';
      localStorage.setItem(storageKey, JSON.stringify(videoHistory));
    }
  }, [videoHistory, user]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate video generation (replace with actual API call)
    setTimeout(() => {
      // For demo purposes, using a placeholder video
      const newVideo = {
        id: Date.now().toString(),
        prompt,
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        timestamp: new Date(),
        style,
        duration,
      };
      
      setGeneratedVideos([newVideo]);
      setVideoHistory(prev => [newVideo, ...prev.slice(0, 49)]); // Keep last 50 videos
      setIsGenerating(false);
    }, 5000);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast.success("Logged out successfully!", {
        position: "top-center",
      });
    } catch (error: any) {
      toast.error("Error logging out", {
        position: "bottom-center",
      });
    }
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const videoStyles = [
    { id: 'realistic', name: 'Realistic', description: 'Photorealistic video generation' },
    { id: 'animated', name: 'Animated', description: 'Cartoon-style animation' },
    { id: 'cinematic', name: 'Cinematic', description: 'Movie-like quality' },
    { id: 'artistic', name: 'Artistic', description: 'Creative and stylized' },
  ];

  const durations = [
    { value: '3', label: '3 seconds' },
    { value: '5', label: '5 seconds' },
    { value: '10', label: '10 seconds' },
    { value: '15', label: '15 seconds' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-red-900/20 backdrop-blur-xl border-b border-purple-200/50 dark:border-purple-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBackToChat && (
              <button
                onClick={onBackToChat}
                className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border border-purple-200 dark:border-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
                title="Back to Chat"
              >
                <ArrowLeft className="text-purple-600 dark:text-purple-400" size={20} />
              </button>
            )}
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Video className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                AI Video Generator
              </h1>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Create stunning videos with AI
              </p>
            </div>
          </div>
          
          {/* User Authentication Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                    {userDetails?.photo ? (
                      <img
                        src={userDetails.photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={12} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {userDetails?.firstName || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSignIn}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-800 transition-all duration-200"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={handleSignUp}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <UserPlus size={16} />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar mobile-optimized-scroll scrollable-area">
        <div className="max-w-4xl mx-auto space-y-8 smooth-scroll">
          {/* Generation Form */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl mobile-optimized-scroll">
            <div className="space-y-6 smooth-scroll">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Video Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to generate... (e.g., 'A serene sunset over a mountain lake with gentle waves')"
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none"
                />
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 smooth-scroll">
                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Clock size={16} className="inline mr-2" />
                    Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2 smooth-scroll">
                    {durations.map((dur) => (
                      <button
                        key={dur.value}
                        onClick={() => setDuration(dur.value)}
                        className={`p-3 rounded-xl border transition-all duration-200 ${
                          duration === dur.value
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="text-sm font-medium">{dur.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Film size={16} className="inline mr-2" />
                    Style
                  </label>
                  <div className="grid grid-cols-2 gap-2 smooth-scroll">
                    {videoStyles.map((styleOption) => (
                      <button
                        key={styleOption.id}
                        onClick={() => setStyle(styleOption.id)}
                        className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                          style === styleOption.id
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="text-sm font-medium">{styleOption.name}</div>
                        <div className="text-xs opacity-75">{styleOption.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {isGenerating ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Generating Video...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate Video</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Video */}
          {generatedVideos.length > 0 && (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-6 flex items-center">
                <Play className="mr-3" size={28} />
                Your Generated Video
              </h3>
              
              {generatedVideos.map((video) => (
                <div key={video.id} className="relative group">
                  <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <video
                      controls
                      className="w-full h-auto"
                      poster="https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&h=450&fit=crop"
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="mt-4 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-purple-200 dark:border-purple-700">
                    <p className="text-purple-800 dark:text-purple-200 font-medium mb-2">
                      <strong>Prompt:</strong> {video.prompt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-purple-600 dark:text-purple-400">
                      <span>Duration: {video.duration}s • Style: {videoStyles.find(s => s.id === video.style)?.name}</span>
                      <span>{video.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Example Prompts */}
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-purple-200/50 dark:border-purple-800/50">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
              <Sparkles className="mr-2" size={20} />
              Example Prompts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "A peaceful forest with sunlight filtering through trees",
                "Ocean waves crashing against rocky cliffs at sunset",
                "A bustling city street with neon lights at night",
                "A field of wildflowers swaying in the gentle breeze"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-purple-200 dark:border-purple-800 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-md"
                >
                  <p className="text-sm text-purple-800 dark:text-purple-200">"{example}"</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};