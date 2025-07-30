import React from 'react';

const ChatRoomUI = ({ messages, currentUser, roomId }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>チャットルーム</h2>
      <div style={styles.roomInfo}>Room ID: {roomId}</div>
      <div style={styles.chatArea}>
        {/* メッセージ一覧表示 */}
        {messages.length === 0 ? (
          <div style={styles.messageBubble}>まだメッセージがありません</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.messageBubble,
                backgroundColor: msg.senderId === currentUser.uid ? '#d1ffd6' : '#e0e0e0',
                alignSelf: msg.senderId === currentUser.uid ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{ fontSize: '12px', color: '#555' }}>{msg.senderId}</div>
              <div>{msg.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '16px',
  },
  roomInfo: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
  },
  chatArea: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '8px',
    height: '300px',
    overflowY: 'auto',
    marginBottom: '12px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  messageBubble: {
    padding: '8px 12px',
    borderRadius: '16px',
    backgroundColor: '#e0e0e0',
    maxWidth: '80%',
    wordBreak: 'break-word',
  },
};

export default ChatRoomUI;
