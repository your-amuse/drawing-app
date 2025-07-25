import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Canvas from './Canvas';
import { useOrder } from '../OrderContext';
import { AuthContext } from '../AuthContext';
import LoginModal from './LoginModal';
import StepProgressBar from './StepProgressBar';
import PageWrapper from './PageWrapper';

const Order = () => {
  const { orderData, setOrderData } = useOrder();
  const { currentUser } = useContext(AuthContext);
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [shouldNavigateAfterLogin, setShouldNavigateAfterLogin] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const navigate = useNavigate();

  const openCanvas = (index) => {
    setActiveImageIndex(index);
    setIsCanvasVisible(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setIsLoginOpen(true);
      setShouldNavigateAfterLogin(true);
      return;
    }
    navigate('/shipping');
  };

  useEffect(() => {
    if (currentUser && shouldNavigateAfterLogin) {
      navigate('/shipping');
      setShouldNavigateAfterLogin(false);
    }
  }, [currentUser, shouldNavigateAfterLogin, navigate]);

  const handleCanvasSave = (updatedImages) => {
    setOrderData(prev => ({ ...prev, images: updatedImages }));
    setIsCanvasVisible(false);
  };

  const handleCanvasCancel = () => {
    setIsCanvasVisible(false);
  };

  // label, input, grid, button のスタイルだけ残す
  const labelStyle = {
    marginBottom: '6px',
    fontWeight: 'bold',
    color: '#333',
    display: 'block',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    backgroundColor: '#fff',
  };

  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px 24px',
  };

  const fullWidthStyle = {
    gridColumn: '1 / -1',
  };

  const thumbnailGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: '120px',
    gap: '12px',
    marginBottom: '30px',
    maxWidth: '480px',
  };

  const imageBoxStyle = {
    backgroundColor: '#fff',
    border: '2px solid #ddd',
    borderRadius: '10px',
    padding: '6px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const buttonStyle = {
    display: 'block',
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
    transition: 'background-color 0.3s ease',
  };

  return (
    <PageWrapper currentStep={0} title="フルオーダー依頼">
      {/* 外枠は PageWrapper 側で制御されている想定 */}
      
      <label style={labelStyle}>参考画像（最大5枚）</label>
      <div style={thumbnailGridStyle}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            style={imageBoxStyle}
            onClick={() => openCanvas(index)}
          >
            {orderData.images?.[index] ? (
              <img
                src={orderData.images[index]}
                alt={`参考画像${index + 1}`}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={formGridStyle}>
          <div style={fullWidthStyle}>
            <label style={labelStyle}>説明</label>
            <textarea name="description" value={orderData.description || ''} onChange={handleChange} rows={6} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>着丈（cm）</label>
            <input type="number" name="length" value={orderData.length || ''} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>身幅（cm）</label>
            <input type="number" name="width" value={orderData.width || ''} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>肩幅（cm）</label>
            <input type="number" name="shoulder" value={orderData.shoulder || ''} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>袖丈（cm）</label>
            <input type="number" name="sleeve" value={orderData.sleeve || ''} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={fullWidthStyle}>
            <label style={labelStyle}>希望素材</label>
            <input type="text" name="material" value={orderData.material || ''} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={fullWidthStyle}>
            <label style={labelStyle}>フィット感</label>
            <select name="fit" value={orderData.fit || 'standard'} onChange={handleChange} style={inputStyle}>
              <option value="tight">タイト</option>
              <option value="standard">標準</option>
              <option value="loose">ゆったり</option>
            </select>
          </div>
        </div>

        <button type="submit" style={buttonStyle}>依頼する</button>
      </form>

      {/* Canvas モーダル */}
      {isCanvasVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: 20,
              width: '90%',
              maxWidth: 850,
              maxHeight: '90vh',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(0,0,0,0.3)',
            }}
          >
            <Canvas
              initialTabIndex={activeImageIndex}
              onCancel={handleCanvasCancel}
              onSave={handleCanvasSave}
            />
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </PageWrapper>
  );
};

export default Order;
