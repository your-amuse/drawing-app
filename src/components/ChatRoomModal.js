import React, { useState, useEffect, useContext } from 'react';
import ChatRoomUI from './ChatRoomUI'; // UI表示用コンポーネント
import { AuthContext } from '../AuthContext';
import { sendMessage } from '../utils/chatUtils';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const ChatRoomModal = ({ roomId, onClose }) => {
  const { currentUser } = useContext(AuthContext);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);

  // Firestoreからメッセージをリアルタイム取得
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'chatRooms', roomId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(roomId, currentUser.uid, inputText);
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={onClose} // 背景クリックで閉じる
      />
      <div
        style={{
          position: 'fixed',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 10000,
          padding: '16px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()} // モーダル内クリックで閉じないように
      >
        <button
          onClick={onClose}
          style={{ alignSelf: 'flex-end', fontSize: '16px', cursor: 'pointer' }}
          aria-label="閉じる"
        >
          ×
        </button>

        {/* メッセージ表示 */}
        <ChatRoomUI messages={messages} currentUser={currentUser} />

        {/* 入力エリア */}
        <div style={{ marginTop: 'auto', marginTop: '16px', display: 'flex', gap: '8px' }}>
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力"
            style={{ flex: 1, resize: 'none', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{ padding: '8px 16px', cursor: inputText.trim() ? 'pointer' : 'not-allowed' }}
          >
            送信
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatRoomModal;
