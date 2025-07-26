// Home.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Home.css'; // CSSファイルを読み込み

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
    <div className="home-container">
      <div
        className="home-header"
        style={{
          backgroundImage: 'url("/titleBack.png")',
        }}
      >
        キャンバスレイアウト修正版3
      </div>

      <div className="home-announcements">
        <h3>最新のお知らせ</h3>
        <div className="home-announcement-list">
          {sortedAnnouncements.map(({ id, title, date, link }) => (
            <div
              key={id}
              onClick={() => navigate(link)}
              className="home-announcement-item"
            >
              {title} <span className="home-announcement-date">（{date}）</span>
            </div>
          ))}
        </div>
      </div>

      <div className="home-image-placeholder">
        説明用のイメージが入ります
      </div>

      <div className="home-button-area">
        <button onClick={() => navigate('/order')} className="home-order-button">
          オーダーメイドを始める
        </button>
      </div>
    </div>
  );
};

export default Home;
