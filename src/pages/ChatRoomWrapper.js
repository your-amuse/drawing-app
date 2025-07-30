import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatRoomModal from '../components/ChatRoomModal';
import ChatRoomPage from '../components/ChatRoomPage';

const ChatRoomWrapper = () => {
  const { roomId } = useParams();
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // PCならモーダル（画面中央のポップアップ）
  // タッチ端末ならページ（フル画面遷移）
  if (isTouchDevice) {
    return <ChatRoomPage roomId={roomId} />;
  } else {
    // モーダル表示は画面上のオーバーレイとして動く想定なので、
    // ここでは何も表示しない or nullを返す
    // ※ 実際はLayoutや親からモーダルのopen状態を管理したほうが良いです
    return null;
  }
};

export default ChatRoomWrapper;
