// src/utils/chatUtils.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function sendMessage(roomId, userId, messageText) {
  if (!messageText.trim()) return;
  try {
    await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
      text: messageText,
      senderId: userId,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('メッセージ送信エラー:', error);
  }
}
