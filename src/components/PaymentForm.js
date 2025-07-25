import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const PaymentForm = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const navigate = useNavigate();
  const { state } = useLocation();

  // カード番号：4桁ごとにスペース
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  const handleCardNumberKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const cursorPos = e.target.selectionStart;
      const value = cardNumber;
      if (
        cursorPos > 0 &&
        value[cursorPos - 1] === ' ' &&
        /\d/.test(value[cursorPos - 2])
      ) {
        e.preventDefault();
        const newValue =
          value.slice(0, cursorPos - 2) + value.slice(cursorPos - 1);
        setCardNumber(newValue);
      }
    }
  };

  // 有効期限：MM/YY 自動フォーマット
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiry(value);
  };

  // CVC：数字のみ、最大4桁
  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvc(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cardNumber || !cardName || !expiry || !cvc) {
      alert('すべての項目を入力してください');
      return;
    }

    navigate('/confirm', {
      state: {
        ...state,
        cardNumber,
        cardName,
        expiry,
        cvc,
      },
    });
  };

  const inputStyle = {
    width: '100%',
    padding: 10,
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: '1rem',
    backgroundColor: '#fff',
  };

  const buttonStyle = {
    width: '100%',
    padding: 12,
    backgroundColor: '#7d5a50',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 16,
    marginTop: 10,
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: 4,
    display: 'block',
    color: '#333',
  };

  return (
    <PageWrapper currentStep={2} title="お支払い情報の入力">
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>カード番号</label>
        <input
          type="text"
          value={cardNumber}
          onChange={handleCardNumberChange}
          onKeyDown={handleCardNumberKeyDown}
          placeholder="1234 5678 9012 3456"
          maxLength={19 + 3}
          style={inputStyle}
        />

        <label style={labelStyle}>カード名義人</label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="TARO YAMADA"
          style={inputStyle}
        />

        <label style={labelStyle}>有効期限 (MM/YY)</label>
        <input
          type="text"
          value={expiry}
          onChange={handleExpiryChange}
          placeholder="MM/YY"
          maxLength={5}
          style={inputStyle}
        />

        <label style={labelStyle}>CVC</label>
        <input
          type="text"
          value={cvc}
          onChange={handleCvcChange}
          placeholder="123"
          maxLength={4}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>確認画面へ</button>
      </form>
    </PageWrapper>
  );
};

export default PaymentForm;
