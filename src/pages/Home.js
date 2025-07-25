// src/pages/Home.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const announcements = [
  { id: 1, title: '新商品発売！', date: '2025-07-10', link: '/lp/new-product' },
  { id: 2, title: '夏季休業のお知らせ', date: '2025-07-15', link: '/lp/summer-holiday' },
  { id: 3, title: 'キャンペーン開始！', date: '2025-07-01', link: '/lp/campaign' },
];

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const sortedAnnouncements = [...announcements].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('ログアウト失敗:', error);
    }
  };

  return (
    <div style={{
      padding: '30px',
      fontFamily: '"Noto Serif JP", serif',
      backgroundColor: '#fdfaf6',
      boxSizing: 'border-box',
      minHeight: '100vh',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      <div style={{
        backgroundImage: 'url("/titleBack.png")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        fontFamily: '"Playfair Display", serif',
        fontSize: '2.8rem',
        color: '#222',
        marginBottom: '20px',
        borderBottom: '2px solid #ccc',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
      }}>
        オーダーメイドストア
      </div>

      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #eae2d0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginBottom: '10px', fontWeight: 'normal', color: '#555' }}>最新のお知らせ</h3>
        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {sortedAnnouncements.map(({ id, title, date, link }) => (
            <div 
              key={id}
              onClick={() => navigate(link)}
              style={{
                cursor: 'pointer',
                marginBottom: '10px',
                color: '#7d5a50',
                textDecoration: 'underline',
                fontSize: '1rem'
              }}
            >
              {title} <span style={{ fontSize: '0.85rem', color: '#999' }}>（{date}）</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        border: '2px dashed #d4c8b0',
        backgroundColor: '#fffaf2',
        height: '250px',
        marginBottom: '30px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        color: '#aaa'
      }}>
        説明用のイメージが入ります
      </div>

      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/order')}
          style={{
            padding: '14px 48px',
            fontSize: '1.2rem',
            fontFamily: '"Playfair Display", serif',
            borderRadius: '28px',
            border: 'none',
            backgroundColor: '#7d5a50',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(125, 90, 80, 0.3)'
          }}
        >
          オーダーメイドを始める
        </button>
      </div>
    </div>
  );
};

export default Home;
