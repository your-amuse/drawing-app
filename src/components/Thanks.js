import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const Thanks = () => {
  const navigate = useNavigate();

  const textStyle = {
    fontSize: '1.2rem',
    color: '#333',
    lineHeight: '1.8',
    textAlign: 'center',
  };

  const buttonStyle = {
    marginTop: '40px',
    padding: '12px 30px',
    fontSize: '1.1rem',
    backgroundColor: '#7d5a50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: '"Playfair Display", serif',
    boxShadow: '0 4px 8px rgba(125, 90, 80, 0.4)',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  return (
    <PageWrapper currentStep={4} title="ご注文ありがとうございます">
      <p style={textStyle}>
        フルオーダー依頼を受け付けました。<br />
        内容を確認のうえ、担当者よりご連絡いたします。
      </p>
      <button style={buttonStyle} onClick={() => navigate('/')}>
        ホームに戻る
      </button>
    </PageWrapper>
  );
};

export default Thanks;
