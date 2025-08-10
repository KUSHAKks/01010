import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Download, Loader, Sparkles, Palette, Zap, ArrowLeft, Share2, History, Trash2, Copy, LogIn, UserPlus, User, LogOut } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: Date;
  style: string;
  aspectRatio: string;
}

interface ImageGeneratorProps {
  onBackToChat?: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBackToChat }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [style, setStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const navigate = useNavigate();

  const HF_TOKEN = "s";

  // Monitor authentication state
  useEffect(() => {
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
  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`flux-image-history-${user.uid}`);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory).map((img: any) => ({
          ...img,
          timestamp: new Date(img.timestamp)
        }));
        setImageHistory(parsedHistory);
      }
    } else {
      const savedHistory = localStorage.getItem('flux-image-history-guest');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory).map((img: any) => ({
          ...img,
          timestamp: new Date(img.timestamp)
        }));
        setImageHistory(parsedHistory);
      }
    }
  }, [user]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (imageHistory.length > 0) {
      const storageKey = user 
        ? `flux-image-history-${user.uid}` 
        : 'flux-image-history-guest';
      localStorage.setItem(storageKey, JSON.stringify(imageHistory));
    }
  }, [imageHistory, user]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch("https://router.huggingface.co/nebius/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response_format: "b64_json",
          prompt: prompt,
          model: "black-forest-labs/flux-dev"
        }),
      });

      if (!response.ok) {
        throw new Error("API Error: " + response.statusText);
      }

      const json = await response.json();
      const base64 = json.data[0]?.b64_json;

      if (!base64) throw new Error("No image received");

      const imageUrl = `data:image/png;base64,${base64}`;
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        imageUrl,
        timestamp: new Date(),
        style,
        aspectRatio,
      };

      setGeneratedImages([newImage]);
      setImageHistory(prev => [newImage, ...prev.slice(0, 49)]); // Keep last 50 images
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `flux-image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async (image: GeneratedImage) => {
    if (navigator.share) {
      try {
        const response = await fetch(image.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `flux-image-${image.id}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'AI Generated Image',
          text: `Generated with prompt: "${image.prompt}"`,
          files: [file],
        });
      } catch (error) {
        console.error('Share failed:', error);
        handleCopyLink(image);
      }
    } else {
      handleCopyLink(image);
    }
  };

  const handleCopyLink = async (image: GeneratedImage) => {
    try {
      await navigator.clipboard.writeText(image.imageUrl);
      // You could add a toast notification here
    } catch (error) {
      console.error('Copy failed:', error);
    }
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

  const deleteFromHistory = (imageId: string) => {
    setImageHistory(prev => prev.filter(img => img.id !== imageId));
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all image history?')) {
      setImageHistory([]);
      const storageKey = user 
        ? `flux-image-history-${user.uid}` 
        : 'flux-image-history-guest';
      localStorage.removeItem(storageKey);
    }
  };

  const imageStyles = [
    { id: 'realistic', name: 'Realistic', description: 'Photorealistic images' },
    { id: 'artistic', name: 'Artistic', description: 'Creative and stylized' },
    { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
    { id: 'digital-art', name: 'Digital Art', description: 'Modern digital artwork' },
    { id: 'oil-painting', name: 'Oil Painting', description: 'Classic oil painting style' },
    { id: 'watercolor', name: 'Watercolor', description: 'Soft watercolor effect' },
  ];

  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:3', label: 'Classic (4:3)' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 backdrop-blur-xl border-b border-emerald-200/50 dark:border-emerald-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBackToChat && (
              <button
                onClick={onBackToChat}
                className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border border-emerald-200 dark:border-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg"
                title="Back to Chat"
              >
                <ArrowLeft className="text-emerald-600 dark:text-emerald-400" size={20} />
              </button>
            )}
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
              <ImageIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                AI Image Generator
              </h1>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Create stunning images with advanced AI
              </p>
            </div>
          </div>
          
          {/* User Authentication Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden">
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
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
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
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-100 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-all duration-200"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={handleSignUp}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {!showHistory ? (
            <div className="space-y-8">
              {/* Generated Images - Display at Top */}
              {generatedImages.length > 0 && (
                <div className="bg-gradient-to-br from-white/90 via-emerald-50/50 to-teal-50/50 dark:from-gray-800/90 dark:via-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl">
                  <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-6 flex items-center">
                    <ImageIcon className="mr-3" size={28} />
                    Your Generated Image
                  </h3>
                  
                  {generatedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="relative bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl overflow-hidden shadow-2xl">
                        <img
                          src={image.imageUrl}
                          alt={`Generated: ${image.prompt}`}
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-4">
                            <button
                              onClick={() => handleDownload(image)}
                              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-emerald-500 hover:text-white"
                              title="Download Image"
                            >
                              <Download size={24} />
                            </button>
                            <button
                              onClick={() => handleShare(image)}
                              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-teal-500 hover:text-white"
                              title="Share Image"
                            >
                              <Share2 size={24} />
                            </button>
                            <button
                              onClick={() => handleCopyLink(image)}
                              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-cyan-500 hover:text-white"
                              title="Copy Image"
                            >
                              <Copy size={24} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-emerald-200 dark:border-emerald-700">
                        <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                          <strong>Prompt:</strong> {image.prompt}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                          <span>Style: {imageStyles.find(s => s.id === image.style)?.name}</span>
                          <span>{image.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Generation Form */}
              <div className="bg-gradient-to-br from-white/90 via-emerald-50/50 to-teal-50/50 dark:from-gray-800/90 dark:via-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl">
                <div className="space-y-6">
                  {/* Prompt Input */}
                  <div>
                    <label className="block text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-4">
                      <Sparkles size={20} className="inline mr-2" />
                      Describe Your Vision
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the image you want to generate... (e.g., 'A majestic dragon soaring through a sunset sky with golden clouds')"
                      className="w-full h-32 px-6 py-4 border-2 border-emerald-300 dark:border-emerald-600 rounded-2xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-emerald-500 dark:placeholder-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 resize-none text-lg"
                    />
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Style Selection */}
                    <div>
                      <label className="block text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-4">
                        <Palette size={20} className="inline mr-2" />
                        Art Style
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {imageStyles.map((styleOption) => (
                          <button
                            key={styleOption.id}
                            onClick={() => setStyle(styleOption.id)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                              style === styleOption.id
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-xl transform scale-105'
                                : 'bg-white/80 dark:bg-gray-800/80 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-400 hover:scale-102'
                            }`}
                          >
                            <div className="font-semibold text-base">{styleOption.name}</div>
                            <div className="text-sm opacity-90 mt-1">{styleOption.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Aspect Ratio Selection */}
                    <div>
                      <label className="block text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-4">
                        <Zap size={20} className="inline mr-2" />
                        Aspect Ratio
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {aspectRatios.map((ratio) => (
                          <button
                            key={ratio.value}
                            onClick={() => setAspectRatio(ratio.value)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                              aspectRatio === ratio.value
                                ? 'bg-gradient-to-br from-teal-500 to-cyan-600 border-teal-500 text-white shadow-xl transform scale-105'
                                : 'bg-white/80 dark:bg-gray-800/80 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-400 hover:scale-102'
                            }`}
                          >
                            <div className="font-semibold text-base">{ratio.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-4 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="animate-spin" size={24} />
                        <span>Generating Your Masterpiece...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={24} />
                        <span>Generate Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Example Prompts */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border border-emerald-200/50 dark:border-emerald-800/50">
                <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center">
                  <Sparkles className="mr-3" size={28} />
                  Inspiration Gallery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    "A futuristic cityscape with flying cars and neon lights at sunset",
                    "A serene Japanese garden with cherry blossoms and a traditional bridge",
                    "A majestic dragon soaring through cloudy mountain peaks",
                    "A cozy cabin in a snowy forest with warm light glowing from windows",
                    "An underwater coral reef with colorful tropical fish and sea creatures",
                    "A steampunk airship floating above Victorian London with brass gears"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-left p-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-emerald-200 dark:border-emerald-800 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-xl hover:scale-105 group"
                    >
                      <p className="text-emerald-800 dark:text-emerald-200 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                        "{example}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* History View */
            <div className="bg-gradient-to-br from-white/90 via-emerald-50/50 to-teal-50/50 dark:from-gray-800/90 dark:via-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center">
                  <History className="mr-3" size={28} />
                  Image History ({imageHistory.length})
                </h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowHistory(false)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                  >
                    Back to Generator
                  </button>
                  {imageHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium flex items-center space-x-2"
                    >
                      <Trash2 size={18} />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>
              </div>
              
              {imageHistory.length === 0 ? (
                <div className="text-center py-16">
                  <ImageIcon className="mx-auto mb-4 text-emerald-400" size={64} />
                  <p className="text-emerald-600 dark:text-emerald-400 text-xl font-medium">No images generated yet</p>
                  <p className="text-emerald-500 dark:text-emerald-500 mt-2">Start creating to see your history here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {imageHistory.map((image) => (
                    <div key={image.id} className="group relative bg-white/80 dark:bg-gray-800/80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <img
                        src={image.imageUrl}
                        alt={`Generated: ${image.prompt}`}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <p className="text-emerald-800 dark:text-emerald-200 font-medium text-sm line-clamp-2 mb-2">
                          {image.prompt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-3">
                          <span>{imageStyles.find(s => s.id === image.style)?.name}</span>
                          <span>{image.timestamp.toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(image)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                          >
                            <Download size={14} />
                            <span className="text-xs font-medium">Download</span>
                          </button>
                          <button
                            onClick={() => handleShare(image)}
                            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                          >
                            <Share2 size={14} />
                            <span className="text-xs font-medium">Share</span>
                          </button>
                          <button
                            onClick={() => deleteFromHistory(image.id)}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};