import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const ConfirmOrder = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return <p>注文情報が見つかりませんでした。</p>;
  }

  const {
    // Order
    length, width, shoulder, sleeve,
    material, purpose, fit, images,

    // Shipping
    name, address, zip, phone,

    // Payment
    cardNumber, cardName, expiry, cvc,
  } = state;

  const handleConfirm = () => {
    // API送信などの最終処理が可能
    navigate('/thanks');
  };

  const headingStyle = {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    marginBottom: '12px',
    color: '#222',
    borderBottom: '2px solid #ccc',
    paddingBottom: '4px',
  };

  const labelStyle = {
    fontWeight: 'normal',
    fontSize: '1.1rem',
    color: '#333',
    marginBottom: '12px',
  };

  const imageBoxStyle = {
    width: '100%',
    maxWidth: '150px',
    height: '100px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginRight: '10px',
    marginBottom: '10px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    fontSize: '1.2rem',
    backgroundColor: '#7d5a50',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: '"Playfair Display", serif',
    marginTop: '20px',
    boxShadow: '0 4px 8px rgba(125, 90, 80, 0.5)',
  };

  return (
    <PageWrapper currentStep={3} title="注文内容の確認">
      <div style={headingStyle}>参考画像</div>
      {images && images.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {images.map((img, idx) =>
            img ? (
              <div key={idx} style={{ ...imageBoxStyle, backgroundImage: `url(${img})` }} />
            ) : null
          )}
        </div>
      ) : (
        <div style={labelStyle}>（未入力）</div>
      )}

      <div style={headingStyle}>製品情報</div>
      <div style={labelStyle}>着丈：{length}cm</div>
      <div style={labelStyle}>身幅：{width}cm</div>
      <div style={labelStyle}>肩幅：{shoulder}cm</div>
      <div style={labelStyle}>袖丈：{sleeve}cm</div>
      <div style={labelStyle}>希望素材：{material || '（未入力）'}</div>
      <div style={labelStyle}>用途・目的：{purpose || '（未入力）'}</div>
      <div style={labelStyle}>フィット感：{fit || '（未入力）'}</div>

      <div style={headingStyle}>配送情報</div>
      <div style={labelStyle}>氏名：{name}</div>
      <div style={labelStyle}>住所：{address}</div>
      <div style={labelStyle}>郵便番号：{zip}</div>
      <div style={labelStyle}>電話番号：{phone}</div>

      <div style={headingStyle}>カード情報</div>
      <div style={labelStyle}>カード番号：{cardNumber}</div>
      <div style={labelStyle}>名義人：{cardName}</div>
      <div style={labelStyle}>有効期限：{expiry}</div>
      <div style={labelStyle}>CVC：{cvc}</div>

      <button style={buttonStyle} onClick={handleConfirm}>
        注文を確定する
      </button>
    </PageWrapper>
  );
};

export default ConfirmOrder;
