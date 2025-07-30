import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatRoomUI from './ChatRoomUI';

const ChatRoomPage = ({ roomId }) => {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '10px 16px',
          backgroundColor: '#7d5a50',
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            marginRight: '12px',
            fontSize: '20px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: 'white',
          }}
          aria-label="戻る"
        >
          ←
        </button>
        チャットルーム
      </header>
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f7f7f7' }}>
        <ChatRoomUI roomId={roomId} />
      </main>
    </div>
  );
};

export default ChatRoomPage;
