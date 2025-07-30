import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatRoomModal from './ChatRoomModal';
// import { getChatRoomsForUser } from '../utils/chatUtils';
import { useAuth } from '../AuthContext';

const dummyChatRooms = [
  {
    id: 'room1',
    imageUrl: 'https://via.placeholder.com/60',
    lastMessage: 'こんにちは、確認いたしました。',
  },
  {
    id: 'room2',
    imageUrl: 'https://via.placeholder.com/60',
    lastMessage: 'ご注文ありがとうございます！',
  },
  {
    id: 'room3',
    imageUrl: 'https://via.placeholder.com/60',
    lastMessage: 'デザインについて相談です。',
  },
];

export default function ChatRoomList() {
  const navigate = useNavigate();
  const [chatRooms] = useState(dummyChatRooms);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const handleRoomClick = (roomId) => {
    if (isTouchDevice) {
      navigate(`/chatrooms/${roomId}`);
    } else {
      setSelectedRoomId(roomId);
      setShowModal(true);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>チャットルーム</h2>
      <div style={styles.list}>
        {chatRooms.map((room) => (
          <div
            key={room.id}
            style={styles.item}
            onClick={() => handleRoomClick(room.id)}
          >
            <img
              src={room.imageUrl}
              alt="Room Thumbnail"
              style={styles.image}
            />
            <div style={styles.message}>{room.lastMessage}</div>
          </div>
        ))}
      </div>

      {/* PC用 モーダル表示 */}
      {showModal && selectedRoomId && (
        <ChatRoomModal
          roomId={selectedRoomId}
          onClose={() => {
            setShowModal(false);
            setSelectedRoomId(null);
          }}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '16px',
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: '20px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    transition: 'background-color 0.2s',
  },
  image: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginRight: '16px',
  },
  message: {
    flex: 1,
    fontSize: '14px',
    color: '#333',
  },
};
