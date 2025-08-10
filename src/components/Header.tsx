import React, { useState, useEffect } from 'react';
import { Download, Trash2, Settings, MoreVertical, User, LogOut, LogIn, UserPlus, MessageSquarePlus } from 'lucide-react';
import { AI_MODELS } from '../constants/models';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  isDarkMode: boolean;
  selectedModel: string;
  messageCount: number;
  currentMode?: 'chat' | 'video' | 'image';
  onToggleTheme: () => void;
  onModelChange: (model: string) => void;
  onClearChat: () => void;
  onExportChat: () => void;
  onSettingsChange?: (isOpen: boolean) => void;
  onNewChat?: () => void;
}

interface UserDetails {
  email: string;
  firstName: string;
  lastName?: string;
  photo: string;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModel,
  messageCount,
  currentMode = 'chat',
  onModelChange,
  onClearChat,
  onExportChat,
  onSettingsChange,
  onNewChat,
}) => {
  const [user, setUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const docRef = doc(db, "Users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserDetails(docSnap.data() as UserDetails);
          } else {
            // If no Firestore document exists, use Firebase Auth data
            setUserDetails({
              email: currentUser.email || '',
              firstName: currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || 'User',
              lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
              photo: currentUser.photoURL || ''
            });
          }
        } catch (error) {
          console.warn("Could not fetch user data from Firestore:", error);
          // Fallback to Firebase Auth data
          setUserDetails({
            email: currentUser.email || '',
            firstName: currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || 'User',
            lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            photo: currentUser.photoURL || ''
          });
        }
      } else {
        setUserDetails(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(showSettings);
    }
  }, [showSettings, onSettingsChange]);

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

  const handleSettingsOpen = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  return (
    <div>
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-3 py-2 sm:px-6 sm:py-4 fixed top-0 left-0 right-0 z-30 w-full md:left-80 md:w-auto">
        <div className="flex flex-row items-center justify-between max-w-full">
          {/* Left: Logo and Model Selector */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg md:ml-16">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">GPT</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {AI_MODELS.find(m => m.id === selectedModel)?.name || 'AI Assistant'}
              </p>
            </div>
            {/* Mobile: Show just the title */}
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">GPT AI</h1>
            </div>
            {/* Model Selector (chat mode only) */}
            {currentMode === 'chat' && (
              <div className="relative w-full max-w-xs ml-2 sm:ml-4 hidden md:block">
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="appearance-none w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  {AI_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <MoreVertical size={14} className="text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Right: Hamburger Menu + Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* New Chat Button for Image/Video modes - Mobile responsive */}
            {(currentMode === 'image' || currentMode === 'video') && onNewChat && (
              <button
                onClick={onNewChat}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  currentMode === 'image'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                }`}
              >
                <MessageSquarePlus size={14} className="sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">New Chat</span>
              </button>
            )}
            
            {/* Action buttons - Responsive sizing */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Export Chat */}
              {currentMode === 'chat' && (
                <button
                  onClick={onExportChat}
                  disabled={messageCount === 0}
                  className="p-2 sm:p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                  title="Export chat"
                >
                  <Download size={14} className="sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-500" />
                </button>
              )}
              {/* Clear Chat */}
              {currentMode === 'chat' && (
                <button
                  onClick={onClearChat}
                  disabled={messageCount === 0}
                  className="p-2 sm:p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                  title="Clear chat"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300 group-hover:text-red-500" />
                </button>
              )}
              {/* Settings - Only show for logged in users */}
              {user && (
                <button
                  onClick={handleSettingsOpen}
                  className="p-2 sm:p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group"
                  title="Settings"
                >
                  <Settings size={14} className="sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100" />
                </button>
              )}
              {/* User Section */}
              {user ? (
                <div className="flex items-center space-x-1 sm:space-x-3">
                  <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center overflow-hidden">
                      {userDetails?.photo ? (
                        <img
                          src={userDetails.photo}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={10} className="sm:w-3 sm:h-3 text-white" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 hidden md:inline">
                      {userDetails?.firstName || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <LogOut size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={handleSignIn}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <LogIn size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">Sign In</span>
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <UserPlus size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">Sign Up</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Hamburger Menu - Mobile Only - Far Right */}
            <button
              className="md:hidden p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 flex-shrink-0 ml-2"
              onClick={() => {
                // Dispatch custom event to toggle sidebar
                window.dispatchEvent(new CustomEvent('toggleSidebar'));
              }}
              aria-label="Toggle sidebar"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && user && (
        <SettingsModal
          user={user}
          userDetails={userDetails}
          onClose={handleSettingsClose}
          onUserDetailsUpdate={setUserDetails}
        />
      )}
    </div>
  );
};