import React, { useState } from 'react';
import { MessageSquarePlus, Moon, Sun, Sparkles, Trash2, Search, Calendar, Video, Image as ImageIcon, History, Download, Share2, Copy } from 'lucide-react';
import { ChatConversation } from '../types/chat';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: Date;
  style: string;
  aspectRatio: string;
}

interface GeneratedVideo {
  id: string;
  prompt: string;
  videoUrl: string;
  timestamp: Date;
  style: string;
  duration: string;
}

interface SidebarProps {
  isDarkMode: boolean;
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onToggleTheme: () => void;
  messageCount: number;
  onModeChange?: (mode: 'chat' | 'video' | 'image') => void;
  currentMode?: 'chat' | 'video' | 'image';
}

export const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  conversations,
  currentConversationId,
  onNewChat,
  onLoadConversation,
  onDeleteConversation,
  onToggleTheme,
  messageCount,
  onModeChange,
  currentMode = 'chat',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [videoHistory, setVideoHistory] = useState<GeneratedVideo[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Monitor authentication state
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const previousUser = currentUser;
      setCurrentUser(user);
      
      if (user) {
        // User logged in - load their specific history
        loadUserHistory(user.uid);
        // Clear guest history if switching from guest to user
        if (!previousUser) {
          clearGuestHistory();
        }
      } else {
        // User logged out - clear user history and load guest history
        if (previousUser) {
          clearUserHistory();
          loadGuestHistory();
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Load user-specific history
  const loadUserHistory = (userId: string) => {
    const savedImageHistory = localStorage.getItem(`flux-image-history-${userId}`);
    if (savedImageHistory) {
      const parsedHistory = JSON.parse(savedImageHistory).map((img: any) => ({
        ...img,
        timestamp: new Date(img.timestamp)
      }));
      setImageHistory(parsedHistory);
    }
    
    const savedVideoHistory = localStorage.getItem(`ai-video-history-${userId}`);
    if (savedVideoHistory) {
      const parsedHistory = JSON.parse(savedVideoHistory).map((vid: any) => ({
        ...vid,
        timestamp: new Date(vid.timestamp)
      }));
      setVideoHistory(parsedHistory);
    }
  };

  // Load guest history
  const loadGuestHistory = () => {
    const savedImageHistory = localStorage.getItem('flux-image-history-guest');
    if (savedImageHistory) {
      const parsedHistory = JSON.parse(savedImageHistory).map((img: any) => ({
        ...img,
        timestamp: new Date(img.timestamp)
      }));
      setImageHistory(parsedHistory);
    }
    
    const savedVideoHistory = localStorage.getItem('ai-video-history-guest');
    if (savedVideoHistory) {
      const parsedHistory = JSON.parse(savedVideoHistory).map((vid: any) => ({
        ...vid,
        timestamp: new Date(vid.timestamp)
      }));
      setVideoHistory(parsedHistory);
    }
  };

  // Clear user-specific history
  const clearUserHistory = () => {
    setImageHistory([]);
    setVideoHistory([]);
  };

  // Clear guest history
  const clearGuestHistory = () => {
    localStorage.removeItem('flux-image-history-guest');
    localStorage.removeItem('ai-video-history-guest');
  };

  const handleNewChat = () => {
    onNewChat();
  };

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation? This action cannot be undone.')) {
      onDeleteConversation(conversationId);
    }
  };

  const handleModeChange = (mode: 'chat' | 'video' | 'image') => {
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  const handleDownloadImage = async (image: GeneratedImage) => {
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

  const handleShareImage = async (image: GeneratedImage) => {
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
        handleCopyImageLink(image);
      }
    } else {
      handleCopyImageLink(image);
    }
  };

  const handleCopyImageLink = async (image: GeneratedImage) => {
    try {
      await navigator.clipboard.writeText(image.imageUrl);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const deleteImageFromHistory = (imageId: string) => {
    const updatedHistory = imageHistory.filter(img => img.id !== imageId);
    setImageHistory(updatedHistory);
    const storageKey = currentUser 
      ? `flux-image-history-${currentUser.uid}` 
      : 'flux-image-history-guest';
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  };

  const clearImageHistory = () => {
    if (window.confirm('Are you sure you want to clear all image history?')) {
      setImageHistory([]);
      const storageKey = currentUser 
        ? `flux-image-history-${currentUser.uid}` 
        : 'flux-image-history-guest';
      localStorage.removeItem(storageKey);
    }
  };

  const deleteVideoFromHistory = (videoId: string) => {
    const updatedHistory = videoHistory.filter(vid => vid.id !== videoId);
    setVideoHistory(updatedHistory);
    const storageKey = currentUser 
      ? `ai-video-history-${currentUser.uid}` 
      : 'ai-video-history-guest';
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  };

  const clearVideoHistory = () => {
    if (window.confirm('Are you sure you want to clear all video history?')) {
      setVideoHistory([]);
      const storageKey = currentUser 
        ? `ai-video-history-${currentUser.uid}` 
        : 'ai-video-history-guest';
      localStorage.removeItem(storageKey);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const groupConversationsByDate = (conversations: ChatConversation[]) => {
    const groups: { [key: string]: ChatConversation[] } = {};
    
    conversations.forEach(conv => {
      const dateKey = formatDate(conv.updatedAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(conv);
    });
    
    return groups;
  };

  const groupedConversations = groupConversationsByDate(filteredConversations);
  const filteredImageHistory = imageHistory.filter(img =>
    img.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredVideoHistory = videoHistory.filter(vid =>
    vid.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col h-screen w-full transition-transform duration-300 relative sticky top-0 mobile-optimized-scroll">
      {/* Mobile close button */}
      <button
        className="md:hidden absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-900 transition-all duration-200"
        onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('closeSidebar'))}
        aria-label="Close sidebar"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      
      {/* Header - Sticky */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-30 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              AI Studio
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create with AI
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => handleModeChange('chat')}
            className={`flex items-center justify-center space-x-1 px-2 py-2 rounded-xl transition-all duration-200 ${
              currentMode === 'chat'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <MessageSquarePlus size={14} />
            <span className="text-xs font-medium">Chat</span>
          </button>
          
          <button
            onClick={() => handleModeChange('video')}
            className={`flex items-center justify-center space-x-1 px-2 py-2 rounded-xl transition-all duration-200 ${
              currentMode === 'video'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Video size={14} />
            <span className="text-xs font-medium">Video</span>
          </button>
          
          <button
            onClick={() => handleModeChange('image')}
            className={`flex items-center justify-center space-x-1 px-2 py-2 rounded-xl transition-all duration-200 ${
              currentMode === 'image'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <ImageIcon size={14} />
            <span className="text-xs font-medium">Image</span>
          </button>
        </div>

        {/* New Chat Button - Only show in chat mode */}
        {currentMode === 'chat' && (
          <button
            onClick={handleNewChat}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <MessageSquarePlus size={18} />
            <span className="font-medium">New Chat</span>
          </button>
        )}
      </div>

      {/* Search - Only show for chat mode or when there's content to search */}
      {(currentMode === 'chat' || 
        (currentMode === 'image' && imageHistory.length > 0) || 
        (currentMode === 'video' && videoHistory.length > 0)) && (
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-20 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={
                currentMode === 'chat' ? "Search conversations..." :
                currentMode === 'image' ? "Search image history..." :
                "Search video history..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* Content - Scrollable Middle Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mobile-optimized-scroll scrollable-area pt-2 min-h-0">
        {currentMode === 'chat' ? (
          /* Chat History */
          Object.keys(groupedConversations).length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquarePlus className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                {searchTerm ? 'Try a different search term' : 'Start a new chat to begin'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-6 smooth-scroll">
              {Object.entries(groupedConversations).map(([dateGroup, convs]) => (
                <div key={dateGroup}>
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar size={14} className="text-gray-400" />
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {dateGroup}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {convs.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => onLoadConversation(conversation.id)}
                        onMouseEnter={() => setHoveredConversation(conversation.id)}
                        onMouseLeave={() => setHoveredConversation(null)}
                        className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          currentConversationId === conversation.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {conversation.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {conversation.messages.length} messages
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {conversation.updatedAt.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          
                          {/* Delete button */}
                          {hoveredConversation === conversation.id && (
                            <button
                              onClick={(e) => handleDeleteConversation(e, conversation.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                              title="Delete conversation"
                            >
                              <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                            </button>
                          )}
                        </div>
                        
                        {/* Active indicator */}
                        {currentConversationId === conversation.id && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : currentMode === 'image' ? (
          /* Image History */
          <div className="p-4 smooth-scroll">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <History size={16} className="text-emerald-500" />
                <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Image History ({imageHistory.length})
                </h3>
              </div>
              {imageHistory.length > 0 && (
                <button
                  onClick={clearImageHistory}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                  title="Clear all images"
                >
                  <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
            
            {filteredImageHistory.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="mx-auto mb-3 text-emerald-400" size={32} />
                <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                  {searchTerm ? 'No images found' : 'No images generated yet'}
                </p>
                <p className="text-emerald-500 dark:text-emerald-500 text-xs mt-1">
                  {searchTerm ? 'Try a different search term' : 'Start generating to see history!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 smooth-scroll">
                {filteredImageHistory.map((image) => (
                  <div
                    key={image.id}
                    className="group bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 border border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={image.imageUrl}
                        alt={image.prompt}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 line-clamp-2 mb-1">
                          {image.prompt}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">
                          {image.timestamp.toLocaleDateString()} • {image.style}
                        </p>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleDownloadImage(image)}
                            className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors duration-200"
                            title="Download"
                          >
                            <Download size={12} className="text-emerald-600 dark:text-emerald-400" />
                          </button>
                          <button
                            onClick={() => handleShareImage(image)}
                            className="p-1 rounded bg-teal-100 dark:bg-teal-900/30 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors duration-200"
                            title="Share"
                          >
                            <Share2 size={12} className="text-teal-600 dark:text-teal-400" />
                          </button>
                          <button
                            onClick={() => handleCopyImageLink(image)}
                            className="p-1 rounded bg-cyan-100 dark:bg-cyan-900/30 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors duration-200"
                            title="Copy"
                          >
                            <Copy size={12} className="text-cyan-600 dark:text-cyan-400" />
                          </button>
                          <button
                            onClick={() => deleteImageFromHistory(image.id)}
                            className="p-1 rounded bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 size={12} className="text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Video History */
          <div className="p-4 smooth-scroll">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <History size={16} className="text-purple-500" />
                <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  Video History ({videoHistory.length})
                </h3>
              </div>
              {videoHistory.length > 0 && (
                <button
                  onClick={clearVideoHistory}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                  title="Clear all videos"
                >
                  <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
            
            {filteredVideoHistory.length === 0 ? (
              <div className="text-center py-8">
                <Video className="mx-auto mb-3 text-purple-400" size={32} />
                <p className="text-purple-600 dark:text-purple-400 text-sm">
                  {searchTerm ? 'No videos found' : 'No videos generated yet'}
                </p>
                <p className="text-purple-500 dark:text-purple-500 text-xs mt-1">
                  {searchTerm ? 'Try a different search term' : 'Start generating to see history!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 smooth-scroll">
                {filteredVideoHistory.map((video) => (
                  <div
                    key={video.id}
                    className="group bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex space-x-3">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200 line-clamp-2 mb-1">
                          {video.prompt}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                          {video.timestamp.toLocaleDateString()} • {video.duration}s • {video.style}
                        </p>
                        <div className="flex space-x-1">
                          <button
                            className="p-1 rounded bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-200"
                            title="Download"
                          >
                            <Download size={12} className="text-purple-600 dark:text-purple-400" />
                          </button>
                          <button
                            className="p-1 rounded bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors duration-200"
                            title="Share"
                          >
                            <Share2 size={12} className="text-pink-600 dark:text-pink-400" />
                          </button>
                          <button
                            onClick={() => deleteVideoFromHistory(video.id)}
                            className="p-1 rounded bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 size={12} className="text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Theme Toggle - Sticky at Bottom */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-30 shadow-lg mt-auto">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
        >
          {isDarkMode ? (
            <>
              <Sun size={18} className="text-yellow-500" />
              <span className="text-gray-700 dark:text-gray-300">Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} className="text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};