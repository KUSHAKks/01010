import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, ChatState, ChatConversation } from '../types/chat';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const GUEST_STORAGE_KEY = 'chatgpt-clone-guest-history';
const GUEST_CONVERSATIONS_KEY = 'chatgpt-clone-guest-conversations';
const GUEST_THEME_KEY = 'chatgpt-clone-guest-theme';
const GUEST_MODEL_KEY = 'chatgpt-clone-guest-model';
const GUEST_CURRENT_CHAT_KEY = 'chatgpt-clone-guest-current-chat';

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isDarkMode: false,
    selectedModel: 'mistralai/mistral-7b-instruct:free',
    isListening: false,
    isSpeaking: false,
  });

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [typewriterText, setTypewriterText] = useState('');
  const [isTypewriting, setIsTypewriting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserData(user.uid);
        loadUserConversations(user.uid);
        // Clear guest data when user logs in
        clearGuestData();
      } else {
        // Load guest data from localStorage
        loadGuestData();
        // Clear user-specific data when user logs out
        clearUserData();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load guest data from localStorage
  const loadGuestData = () => {
    const savedMessages = localStorage.getItem(GUEST_STORAGE_KEY);
    const savedConversations = localStorage.getItem(GUEST_CONVERSATIONS_KEY);
    const savedTheme = localStorage.getItem(GUEST_THEME_KEY);
    const savedModel = localStorage.getItem(GUEST_MODEL_KEY);
    const savedCurrentChatId = localStorage.getItem(GUEST_CURRENT_CHAT_KEY);
    
    setState(prev => ({
      ...prev,
      messages: savedMessages ? JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })) : [],
      isDarkMode: savedTheme === 'dark',
      selectedModel: savedModel || 'mistralai/mistral-7b-instruct:free',
    }));

    if (savedConversations) {
      const parsedConversations = JSON.parse(savedConversations).map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setConversations(parsedConversations);
    }

    if (savedCurrentChatId) {
      setCurrentConversationId(savedCurrentChatId);
    }
  };

  // Clear guest data from localStorage
  const clearGuestData = () => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem(GUEST_CONVERSATIONS_KEY);
    localStorage.removeItem(GUEST_CURRENT_CHAT_KEY);
  };

  // Clear user-specific data when logging out
  const clearUserData = () => {
    setState(prev => ({ ...prev, messages: [] }));
    setConversations([]);
    setCurrentConversationId(null);
    
    // Clear any ongoing typewriter effect
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
      setIsTypewriting(false);
      setTypewriterText('');
    }
  };

  // Save guest data to localStorage
  const saveGuestData = () => {
    if (!currentUser) {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(state.messages));
      localStorage.setItem(GUEST_CONVERSATIONS_KEY, JSON.stringify(conversations));
      localStorage.setItem(GUEST_THEME_KEY, state.isDarkMode ? 'dark' : 'light');
      localStorage.setItem(GUEST_MODEL_KEY, state.selectedModel);
      if (currentConversationId) {
        localStorage.setItem(GUEST_CURRENT_CHAT_KEY, currentConversationId);
      } else {
        localStorage.removeItem(GUEST_CURRENT_CHAT_KEY);
      }
    }
  };

  // Load user preferences and current conversation
  const loadUserData = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'Users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setState(prev => ({
          ...prev,
          isDarkMode: userData.isDarkMode || false,
          selectedModel: userData.selectedModel || 'mistralai/mistral-7b-instruct:free',
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Load user's conversations from Firestore
  const loadUserConversations = async (userId: string) => {
    try {
      const conversationsRef = collection(db, 'Users', userId, 'conversations');
      const q = query(conversationsRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const userConversations: ChatConversation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userConversations.push({
          id: doc.id,
          title: data.title,
          messages: data.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp.toDate(),
          })),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
      
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Save user preferences to Firestore
  const saveUserPreferences = async (userId: string, preferences: any) => {
    try {
      const userDocRef = doc(db, 'Users', userId);
      await setDoc(userDocRef, preferences, { merge: true });
    } catch (error) {
      console.warn('Could not save user preferences to Firestore:', error);
      // Don't throw error, just log warning
    }
  };

  // Save conversation to Firestore or localStorage
  const saveConversationToFirestore = async (conversation: ChatConversation) => {
    if (currentUser) {
      try {
        const conversationRef = doc(db, 'Users', currentUser.uid, 'conversations', conversation.id);
        await setDoc(conversationRef, {
          title: conversation.title,
          messages: conversation.messages,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        });
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
  };

  // Delete conversation from Firestore or localStorage
  const deleteConversationFromFirestore = async (conversationId: string) => {
    if (currentUser) {
      try {
        const conversationRef = doc(db, 'Users', currentUser.uid, 'conversations', conversationId);
        await deleteDoc(conversationRef);
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    if (currentUser) {
      saveUserPreferences(currentUser.uid, { isDarkMode: state.isDarkMode });
    } else {
      saveGuestData();
    }
    document.documentElement.classList.toggle('dark', state.isDarkMode);
  }, [state.isDarkMode, currentUser]);

  // Save model preference when it changes
  useEffect(() => {
    if (currentUser) {
      saveUserPreferences(currentUser.uid, { selectedModel: state.selectedModel });
    } else {
      saveGuestData();
    }
  }, [state.selectedModel, currentUser]);

  // Save guest data when messages or conversations change
  useEffect(() => {
    if (!currentUser) {
      saveGuestData();
    }
  }, [state.messages, conversations, currentConversationId, currentUser]);

  // Typewriter effect function
  const typewriterEffect = useCallback((text: string, messageId: string) => {
    setIsTypewriting(true);
    setTypewriterText('');
    let index = 0;

    const typeNextChar = () => {
      if (index < text.length) {
        setTypewriterText(prev => prev + text[index]);
        index++;
        typewriterTimeoutRef.current = setTimeout(typeNextChar, 30);
      } else {
        setIsTypewriting(false);
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId ? { ...msg, content: text } : msg
          )
        }));
        setTypewriterText('');
      }
    };

    typeNextChar();
  }, []);

  // Generate conversation title from first message
  const generateConversationTitle = (firstMessage: string): string => {
    const words = firstMessage.trim().split(' ');
    if (words.length <= 6) return firstMessage;
    return words.slice(0, 6).join(' ') + '...';
  };

  // Save current conversation
  const saveCurrentConversation = useCallback(() => {
    if (state.messages.length === 0) return;

    const now = new Date();
    const firstUserMessage = state.messages.find(m => m.role === 'user')?.content || 'New Chat';
    const title = generateConversationTitle(firstUserMessage);

    if (currentConversationId) {
      // Update existing conversation
      const updatedConversation: ChatConversation = {
        id: currentConversationId,
        title,
        messages: state.messages,
        createdAt: conversations.find(c => c.id === currentConversationId)?.createdAt || now,
        updatedAt: now,
      };
      
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId ? updatedConversation : conv
      ));
      
      saveConversationToFirestore(updatedConversation);
    } else {
      // Create new conversation
      const newConversation: ChatConversation = {
        id: Date.now().toString(),
        title,
        messages: state.messages,
        createdAt: now,
        updatedAt: now,
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      saveConversationToFirestore(newConversation);
    }
  }, [state.messages, currentConversationId, conversations, currentUser]);

  // Auto-save conversation when messages change
  useEffect(() => {
    if (state.messages.length > 0) {
      const timeoutId = setTimeout(saveCurrentConversation, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [state.messages, saveCurrentConversation]);

  const sendMessage = useCallback(async (userInput: string, attachments?: File[]) => {
    if (!userInput.trim() && (!attachments || attachments.length === 0)) return;

    // Clear any ongoing typewriter effect
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
      setIsTypewriting(false);
      setTypewriterText('');
    }

    let messageContent = userInput;
    
    // Add file information to message if attachments exist
    if (attachments && attachments.length > 0) {
      const fileInfo = attachments.map(file => `📎 ${file.name} (${file.size} bytes)`).join('\n');
      messageContent = userInput ? `${userInput}\n\n${fileInfo}` : fileInfo;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: state.selectedModel,
          messages: [{ role: 'user', content: userInput }],
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || 'No response received.';

      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isMarkdown: true,
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false,
      }));

      typewriterEffect(content, botMessageId);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));
    }
  }, [state.selectedModel, typewriterEffect]);

  const startNewChat = useCallback(() => {
    // Clear any ongoing typewriter effect
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
      setIsTypewriting(false);
      setTypewriterText('');
    }

    setState(prev => ({ ...prev, messages: [] }));
    setCurrentConversationId(null);
    
    // Clear guest storage if not logged in
    if (!currentUser) {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.removeItem(GUEST_CURRENT_CHAT_KEY);
    }
  }, [currentUser]);

  const loadConversation = useCallback((conversationId: string) => {
    // Clear any ongoing typewriter effect
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
      setIsTypewriting(false);
      setTypewriterText('');
    }

    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setState(prev => ({ ...prev, messages: conversation.messages }));
      setCurrentConversationId(conversationId);
    }
  }, [conversations]);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    deleteConversationFromFirestore(conversationId);
    
    if (currentConversationId === conversationId) {
      startNewChat();
    }
  }, [currentConversationId, startNewChat]);

  const clearChat = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      startNewChat();
    }
  }, [startNewChat]);

  const toggleTheme = useCallback(() => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  }, []);

  const setSelectedModel = useCallback((model: string) => {
    setState(prev => ({ ...prev, selectedModel: model }));
  }, []);

  const copyMessage = useCallback(async (content: string, isMarkdown?: boolean) => {
    try {
      const textToCopy = isMarkdown ? 
        content.replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, '\n').trim() : 
        content;
      
      await navigator.clipboard.writeText(textToCopy);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setState(prev => ({ ...prev, isListening: true }));
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setState(prev => ({ ...prev, isListening: false }));
      return transcript;
    };

    recognitionRef.current.onerror = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current.start();
  }, []);

  const speakMessage = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        setState(prev => ({ ...prev, isSpeaking: true }));
      };
      
      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  const exportChat = useCallback(() => {
    const chatContent = state.messages.map(msg => 
      `**${msg.role === 'user' ? 'You' : 'Assistant'}** (${msg.timestamp.toLocaleString()})\n${msg.content}\n\n`
    ).join('');
    
    const blob = new Blob([chatContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.messages]);

  const editLastMessage = useCallback((newContent: string) => {
    const messages = [...state.messages];
    const lastUserMessageIndex = messages.map(m => m.role).lastIndexOf('user');
    
    if (lastUserMessageIndex !== -1) {
      const newMessages = messages.slice(0, lastUserMessageIndex);
      setState(prev => ({ ...prev, messages: newMessages }));
      sendMessage(newContent);
    }
  }, [state.messages, sendMessage]);

  // Cleanup typewriter timeout on unmount
  useEffect(() => {
    return () => {
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    conversations,
    currentConversationId,
    typewriterText,
    isTypewriting,
    sendMessage,
    startNewChat,
    loadConversation,
    deleteConversation,
    clearChat,
    toggleTheme,
    setSelectedModel,
    copyMessage,
    startListening,
    speakMessage,
    stopSpeaking,
    exportChat,
    editLastMessage,
    recognitionRef,
  };
};