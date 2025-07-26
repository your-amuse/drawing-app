import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      setSidebarOpen(false);
    } catch (err) {
      console.error('ログアウト失敗:', err);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {isTouchDevice && (
        <>
          <header className="layout-header">
            <div className="layout-logo" onClick={() => { navigate('/'); setSidebarOpen(false); }}>
              オーダーメイドストア
            </div>
            <div className="layout-user">
              {currentUser ? (
                <span className="user-email">{currentUser.email}</span>
              ) : (
                <button className="login-button" onClick={() => { navigate('/login'); setSidebarOpen(false); }}>
                  ログイン
                </button>
              )}
            </div>
            <button className="hamburger-button" onClick={toggleSidebar} aria-label="メニュー開閉">
              &#9776; menu
            </button>
          </header>

          <nav className={`layout-left-mobile ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-user-info">
              <div className="sidebar-user-email" onClick={() => {
                if (!currentUser) {
                  navigate('/login');
                  setSidebarOpen(false);
                }
              }}>
                {currentUser ? currentUser.email : 'ログイン'}
              </div>
              {currentUser && (
                <button className="sidebar-logout-button" onClick={handleLogout}>
                  ログアウト
                </button>
              )}
            </div>
            <ul className="sidebar-menu">
              <li onClick={() => { navigate('/userinfo'); setSidebarOpen(false); }}>ユーザー情報</li>
              <li onClick={() => { navigate('/chatroom'); setSidebarOpen(false); }}>チャットルーム</li>
              <li onClick={() => { navigate('/contact'); setSidebarOpen(false); }}>お問い合わせ</li>
            </ul>
          </nav>

          {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
        </>
      )}

      <div className="layout-container">
        {!isTouchDevice && (
          <aside className="layout-left pc-sidebar">
            <div onClick={() => navigate('/')} style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#7d5a50', marginBottom: '20px', cursor: 'pointer', textAlign: 'center', fontFamily: '"Noto Serif JP", serif' }}>
              オーダーメイドストア
            </div>
            <div className="sidebar-user-info" onClick={() => { if (!currentUser) navigate('/login'); }}>
              <div className="sidebar-user-email">{currentUser ? currentUser.email : 'ログイン'}</div>
              {currentUser && (
                <button className="sidebar-logout-button" onClick={handleLogout}>
                  ログアウト
                </button>
              )}
            </div>
            <ul className="sidebar-menu">
              <li onClick={() => navigate('/userinfo')}>ユーザー情報</li>
              <li onClick={() => navigate('/chatroom')}>チャットルーム</li>
              <li onClick={() => navigate('/contact')}>お問い合わせ</li>
            </ul>
          </aside>
        )}

        <main className="layout-main">
          <Outlet />
        </main>

        {!isTouchDevice && (
          <aside className="layout-right">
            <div className="right-box"><a href="/ranking">人気商品ランキング</a></div>
            <div className="right-box">新着商品情報 Coming Soon...</div>
          </aside>
        )}
      </div>
    </>
  );
};

export default Layout;
