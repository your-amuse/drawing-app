// src/components/Layout.js
import React, { useContext } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Layout = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('ログアウト失敗:', err);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr 220px',
        gap: '20px',
        padding: '30px',
        fontFamily: '"Noto Serif JP", serif',
        backgroundColor: '#fdfaf6',
        minHeight: '100vh',
        boxSizing: 'border-box',
        backgroundImage: 'url("/pageBack.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 左サイドバー */}
      <div style={{ borderRight: '1px solid #e0d6c8', paddingRight: '15px' }}>
        <div
          onClick={() => navigate('/')}
          style={{
            fontWeight: 'bold',
            fontSize: '1.3rem',
            color: '#7d5a50',
            marginBottom: '20px',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          オーダーメイドストア
        </div>

        <div
          style={{
            border: '1px solid #7d5a50',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '15px',
            textAlign: 'center',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#7d5a50',
            backgroundColor: '#fff8f2',
          }}
          onClick={() => {
            if (!currentUser) navigate('/login');
          }}
        >
          {currentUser ? currentUser.email : 'ログイン'}
        </div>

        {currentUser && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                fontSize: '0.9rem',
                borderRadius: '6px',
                border: '1px solid #7d5a50',
                backgroundColor: '#fff',
                color: '#7d5a50',
                cursor: 'pointer',
              }}
            >
              ログアウト
            </button>
          </div>
        )}

        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95rem', color: '#444', lineHeight: '1.8' }}>
          <li style={{ cursor: 'pointer' }}>ユーザー情報</li>
          <li style={{ cursor: 'pointer' }}>チャットルーム</li>
          <li style={{ cursor: 'pointer' }}>お問い合わせ</li>
        </ul>
      </div>

      {/* メインコンテンツ */}
      <div>
        <Outlet />
      </div>

      {/* 右サイドバー */}
      <div style={{ borderLeft: '1px solid #e0d6c8', paddingLeft: '15px', color: '#444', fontSize: '0.95rem' }}>
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            backgroundColor: '#fff',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <a href="/ranking" style={{ color: '#7d5a50', textDecoration: 'underline' }}>
            人気商品ランキング
          </a>
        </div>
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            backgroundColor: '#fff',
            padding: '15px',
            textAlign: 'center',
          }}
        >
          新着商品情報 Coming Soon...
        </div>
      </div>
    </div>
  );
};

export default Layout;
