import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Canvas from './Canvas';
import { useOrder } from '../OrderContext';
import { AuthContext } from '../AuthContext';
import LoginModal from './LoginModal';
import PageWrapper from './PageWrapper';

const categoryFields = {
  tops: {
    length: 60,
    width: 50,
    shoulder: 40,
    sleeve: 60,
  },
  bottoms: {
    waist: 70,
    hip: 90,
    inseam: 70,
    rise: 25,
  },
  dress: {
    length: 110,
    width: 45,
    shoulder: 38,
    sleeve: 50,
  },
};

const Order = () => {
  const { orderData, setOrderData } = useOrder();
  const { currentUser } = useContext(AuthContext);
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [shouldNavigateAfterLogin, setShouldNavigateAfterLogin] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [category, setCategory] = useState('tops');
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isCanvasVisible) {
      document.body.style.overflow = 'hidden';
      const preventTouchMove = (e) => e.preventDefault();
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('touchmove', preventTouchMove);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isCanvasVisible]);

  const openCanvas = (index) => {
    setActiveImageIndex(index);
    setIsCanvasVisible(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    setOrderData(prev => ({
      ...prev,
      ...categoryFields[newCategory]
    }));
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

  const handleCanvasSave = (updatedTabs) => {
    const updatedImages = updatedTabs.map(tab => tab.dataURL);
    setOrderData(prev => ({ ...prev, images: updatedImages }));
    setIsCanvasVisible(false);
  };

  const handleCanvasCancel = () => {
    setIsCanvasVisible(false);
  };

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
    boxSizing: 'border-box',
  };

  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '20px 24px',
  };

  const fullWidthStyle = {
    gridColumn: '1 / -1',
  };

  const thumbnailGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, 160px)',
    gap: '16px',
    marginBottom: '30px',
    maxWidth: '420px',
  };

  const imageBoxStyle = {
    backgroundColor: '#fff',
    border: '3px solid #999',
    borderRadius: '14px',
    padding: '8px',
    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
  };

  const buttonStyle = {
    display: 'block',
    width: '100%',
    padding: isMobile ? '12px' : '15px',
    fontSize: isMobile ? '1rem' : '1.2rem',
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

  const renderSizeInputs = () => {
    const fields = categoryFields[category];
    return Object.keys(fields).map((key) => (
      <div key={key}>
        <label style={labelStyle}>{key}（cm）</label>
        <input
          type="number"
          name={key}
          value={orderData[key] || ''}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>
    ));
  };

  return (
    <PageWrapper currentStep={0} title="フルオーダー依頼">
      <label style={labelStyle}>参考画像（最大4枚）</label>
      <div style={thumbnailGridStyle}>
        {Array.from({ length: 4 }).map((_, index) => (
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
            <textarea
              name="description"
              value={orderData.description || ''}
              onChange={handleChange}
              rows={6}
              style={inputStyle}
            />
          </div>

          <div style={fullWidthStyle}>
            <label style={labelStyle}>カテゴリ</label>
            <select
              name="category"
              value={category}
              onChange={handleCategoryChange}
              style={inputStyle}
            >
              <option value="tops">トップス</option>
              <option value="bottoms">ボトムス</option>
              <option value="dress">ワンピース</option>
            </select>
          </div>

          {renderSizeInputs()}

          <div style={fullWidthStyle}>
            <label style={labelStyle}>希望素材</label>
            <input
              type="text"
              name="material"
              value={orderData.material || ''}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={fullWidthStyle}>
            <label style={labelStyle}>フィット感</label>
            <select
              name="fit"
              value={orderData.fit || 'standard'}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="tight">タイト</option>
              <option value="standard">標準</option>
              <option value="loose">ゆったり</option>
            </select>
          </div>
        </div>

        <button type="submit" style={buttonStyle}>依頼する</button>
      </form>

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
            touchAction: 'none',
          }}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background: '#fff',
              padding: 20,
              width: '100%',
              maxWidth: 1000,
              maxHeight: '100vh',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(0,0,0,0.3)',
              border: '12px solid #111',
              boxSizing: 'border-box',
              touchAction: 'none',
            }}
          >
            <Canvas
              key={activeImageIndex}
              initialTabIndex={activeImageIndex}
              onCancel={handleCanvasCancel}
              onSave={handleCanvasSave}
            />
          </div>
        </div>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </PageWrapper>
  );
};

export default Order;
