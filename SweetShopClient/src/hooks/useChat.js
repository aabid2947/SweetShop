import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc,
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { db, generateChatId } from '../config/firebase';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useStoreMessageMutation } from '../features/api/apiSlice';

/**
 * Custom hook for real-time chat functionality
 * @param {string} otherUserId - The ID of the user you're chatting with
 * @returns {object} Chat state and functions
 */
export const useChat = (otherUserId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  
  const currentUser = useSelector(selectCurrentUser);
  const currentUserId = currentUser?._id;
  
  // Add connection status tracking
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  // RTK Query mutation for backend storage
  const [storeMessage] = useStoreMessageMutation();
  
  // Generate deterministic chat ID
  const chatId = currentUserId && otherUserId ? generateChatId(currentUserId, otherUserId) : null;

  const MESSAGES_PER_PAGE = 20;

  // Real-time message listener for recent messages
  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      setConnectionStatus('idle');
      return;
    }

    setLoading(true);
    setError(null);
    setConnectionStatus('connecting');

    try {
      // Create query for recent messages in this chat (descending order)
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(MESSAGES_PER_PAGE));

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messageList = [];
          snapshot.forEach((doc) => {
            messageList.push({
              id: doc.id,
              ...doc.data(),
              // Convert Firestore timestamp to Date
              timestamp: doc.data().timestamp?.toDate() || new Date()
            });
          });
          
          // Store last visible document for pagination
          const lastDoc = snapshot.docs[snapshot.docs.length - 1];
          setLastVisible(lastDoc);
          setHasMoreMessages(snapshot.docs.length === MESSAGES_PER_PAGE);
          
          // Reverse to show chronological order (oldest first)
          setMessages(messageList.reverse());
          setLoading(false);
          setConnectionStatus('connected');
          setError(null);
        },
        (error) => {
          console.error('Error fetching messages:', error);
          console.error('Error code:', error.code);
          console.error('Error details:', error.message);
          
          // More specific error handling
          if (error.code === 'permission-denied') {
            setError('Permission denied. Please check Firestore security rules.');
          } else if (error.code === 'unavailable') {
            setError('Firestore service unavailable. Please check your internet connection.');
          } else if (error.code === 'failed-precondition') {
            setError('Firestore database not properly configured.');
          } else {
            setError(`Connection error: ${error.message}`);
          }
          
          setLoading(false);
          setConnectionStatus('error');
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setError('Failed to initialize chat connection');
      setLoading(false);
      setConnectionStatus('error');
    }
  }, [chatId]);

  // Load older messages (pagination)
  const loadOlderMessages = useCallback(async () => {
    if (!chatId || !lastVisible || !hasMoreMessages || loadingOlder) {
      return;
    }

    setLoadingOlder(true);
    
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(
        messagesRef, 
        orderBy('timestamp', 'desc'), 
        startAfter(lastVisible), 
        limit(MESSAGES_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMoreMessages(false);
        setLoadingOlder(false);
        return;
      }

      const olderMessages = [];
      snapshot.forEach((doc) => {
        olderMessages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        });
      });

      // Update last visible for next pagination
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(newLastDoc);
      setHasMoreMessages(snapshot.docs.length === MESSAGES_PER_PAGE);

      // Prepend older messages (reverse to maintain chronological order)
      setMessages(prev => [...olderMessages.reverse(), ...prev]);
      
    } catch (error) {
      console.error('Error loading older messages:', error);
      setLoading(false);
      setConnectionStatus('error');
      setError('Failed to load older messages');
    } finally {
      setLoadingOlder(false);
    }
  }, [chatId, lastVisible, hasMoreMessages, loadingOlder]);

  // Send message function with optimistic updates
  const sendMessage = useCallback(async (text, messageType = 'text') => {
    if (!chatId || !currentUserId || !otherUserId || !text.trim()) {
      return;
    }

    // Create optimistic message
    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      senderId: currentUserId,
      receiverId: otherUserId,
      text: text.trim(),
      messageType,
      timestamp: new Date(),
      isRead: false,
      isOptimistic: true
    };

    // Add optimistic message immediately to UI
    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    setError(null);

    try {
      const messageData = {
        senderId: currentUserId,
        receiverId: otherUserId,
        text: text.trim(),
        messageType,
        timestamp: serverTimestamp(),
        isRead: false
      };

      // 1. Add message to Firestore for real-time updates
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const docRef = await addDoc(messagesRef, messageData);

      // Remove optimistic message when real message arrives
      setOptimisticMessages(prev => 
        prev.filter(msg => msg.id !== optimisticMessage.id)
      );

      // 2. Also store in backend for reference using RTK Query (fire and forget)
      try {
        await storeMessage({
          chatId,
          senderId: currentUserId,
          receiverId: otherUserId,
          content: text.trim(),
          messageType,
          firebaseMessageId: docRef.id
        }).unwrap();
      } catch (backendError) {
        // Don't fail the message send if backend storage fails
        console.warn('Backend message storage failed:', backendError);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed optimistic message
      setOptimisticMessages(prev => 
        prev.filter(msg => msg.id !== optimisticMessage.id)
      );
      setError(error.message);
      throw error;
    }
  }, [chatId, currentUserId, otherUserId, currentUser?.token]);

  // Combine real messages with optimistic messages
  const allMessages = [...messages, ...optimisticMessages].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Mark messages as read (optional)
  const markAsRead = useCallback(async (messageIds) => {
    if (!chatId || !Array.isArray(messageIds)) return;

    try {
      // Update read status in Firestore
      const promises = messageIds.map(messageId => {
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
        return setDoc(messageRef, { isRead: true }, { merge: true });
      });
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [chatId]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return allMessages.filter(msg => 
      msg.receiverId === currentUserId && !msg.isRead
    ).length;
  }, [allMessages, currentUserId]);

  return {
    messages: allMessages,
    loading,
    sending,
    error,
    connectionStatus,
    sendMessage,
    markAsRead,
    getUnreadCount,
    chatId,
    loadOlderMessages,
    loadingOlder,
    hasMoreMessages
  };
};

export default useChat;
