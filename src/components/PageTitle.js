// src/components/PageTitle.js
import React from 'react';

const PageTitle = ({ title }) => (
  <div style={{ position: 'relative', width: '100%', height: '120px', marginBottom: '20px' }}>
    <img
      src="/titleBack.png"
      alt="タイトル背景"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'fill', // 比率崩れても縦横引き伸ばし
        pointerEvents: 'none',
      }}
    />
    <div
      style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Playfair Display", serif',
        fontSize: '2.8rem',
        color: '#222',
        zIndex: 1,
      }}
    >
      {title}
    </div>
  </div>
);

export default PageTitle;
