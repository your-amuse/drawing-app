import React, { useRef, useState, useEffect } from 'react';
import { useOrder } from '../OrderContext';

const MAX_TABS = 5;
const MAX_HISTORY = 40;

const Canvas = ({ onCancel, onSave, initialTabIndex = 0 }) => {
  const { orderData } = useOrder();
  const normalizedImages = Array.isArray(orderData.images) ? [...orderData.images] : [];
  while (normalizedImages.length < MAX_TABS) normalizedImages.push(null);

  const [tabs, setTabs] = useState(() =>
    normalizedImages.map((img, i) => ({
      id: Date.now() + i,
      name: (i + 1).toString(),
      dataURL: img,
    }))
  );
  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);

  const canvasRef = useRef(null);
  const [histories, setHistories] = useState(() =>
    Array(MAX_TABS).fill().map(() => [])
  );
  const [redos, setRedos] = useState(() =>
    Array(MAX_TABS).fill().map(() => [])
  );

  const [canvasHeight, setCanvasHeight] = useState(() =>
    Math.floor(window.innerHeight * 0.5)
  );
  useEffect(() => {
    const handleResize = () =>
      setCanvasHeight(Math.floor(window.innerHeight * 0.6));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => setActiveTabIndex(initialTabIndex), [initialTabIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const drawImage = (imgSrc) => {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHistories((prev) => {
          const updated = [...prev];
          if (updated[activeTabIndex].length === 0) {
            updated[activeTabIndex] = [canvas.toDataURL()];
          }
          return updated;
        });
      };
      img.src = imgSrc;
    };

    const current = tabs[activeTabIndex];
    current?.dataURL
      ? drawImage(current.dataURL)
      : ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [activeTabIndex, canvasHeight, tabs]);

  const getRelativePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    setLastPos(getRelativePos(e));
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const newPos = getRelativePos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(newPos.x, newPos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    setLastPos(newPos);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasToTab();
  };

  const handlePointerLeave = () => {
    if (isDrawing) handlePointerUp();
  };

  const saveCanvasToTab = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();
    setTabs((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = { ...updated[activeTabIndex], dataURL };
      return updated;
    });
    setHistories((prev) => {
      const updated = [...prev];
      const history = [...updated[activeTabIndex], dataURL];
      if (history.length > MAX_HISTORY) history.shift();
      updated[activeTabIndex] = history;
      return updated;
    });
    setRedos((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = [];
      return updated;
    });
  };

  const restoreCanvas = (dataURL) =>
    new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.src = dataURL;
    });

  const handleUndo = async () => {
    const history = histories[activeTabIndex];
    if (history.length <= 1) return;
    const newHistory = [...history];
    const last = newHistory.pop();
    setRedos((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = [last, ...updated[activeTabIndex]];
      return updated;
    });
    const prevDataURL = newHistory[newHistory.length - 1];
    await restoreCanvas(prevDataURL);
    setTabs((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = { ...updated[activeTabIndex], dataURL: prevDataURL };
      return updated;
    });
    setHistories((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = newHistory;
      return updated;
    });
  };

  const handleRedo = async () => {
    const redoStack = redos[activeTabIndex];
    if (redoStack.length === 0) return;
    const [first, ...rest] = redoStack;
    await restoreCanvas(first);
    setTabs((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = { ...updated[activeTabIndex], dataURL: first };
      return updated;
    });
    setHistories((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = [...updated[activeTabIndex], first];
      return updated;
    });
    setRedos((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = rest;
      return updated;
    });
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveCanvasToTab();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        saveCanvasToTab();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 10, height: '90vh', overflow: 'auto' }}>
      {/* タブ切り替え */}
      <div style={{ marginBottom: 8 }}>
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabIndex(idx)}
            disabled={isDrawing}
            style={{
              fontWeight: idx === activeTabIndex ? 'bold' : 'normal',
              marginRight: 6,
              borderRadius: 4,
              padding: '4px 8px',
              border: '1px solid #ccc',
              background: idx === activeTabIndex ? '#f0e7e3' : '#fff',
              cursor: isDrawing ? 'not-allowed' : 'pointer',
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* キャンバス */}
      <div
        style={{
          border: '1px solid #aaa',
          borderRadius: 10,
          width: '100%',
          maxWidth: 600,
          margin: '0 auto 10px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={canvasHeight}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            borderRadius: 10,
            cursor: 'crosshair',
            touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        />
      </div>

      {/* ツールバー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <select
          value={tool}
          onChange={(e) => setTool(e.target.value)}
          disabled={isDrawing}
          style={{ padding: 6, borderRadius: 6 }}
        >
          <option value="pen">✏️ ペン</option>
          <option value="eraser">🧽 消しゴム</option>
        </select>

        <label title="色">
          🎨
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={tool === 'eraser' || isDrawing}
            style={{ marginLeft: 4, width: 36, height: 36, border: 'none' }}
          />
        </label>

        <label title="線の太さ" style={{ display: 'flex', alignItems: 'center' }}>
          ●
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            disabled={isDrawing}
            style={{ marginLeft: 6 }}
          />
        </label>

        <button onClick={handleUndo} disabled={isDrawing || histories[activeTabIndex].length <= 1}>
          ↩️
        </button>
        <button onClick={handleRedo} disabled={isDrawing || redos[activeTabIndex].length === 0}>
          ↪️
        </button>
        <button onClick={clearCanvas} disabled={isDrawing}>
          🧹
        </button>

        <label>
          📁
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isDrawing}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* 完了・キャンセル */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button onClick={onCancel} disabled={isDrawing}>
          キャンセル
        </button>
        <button
          onClick={() => onSave(tabs)}
          disabled={isDrawing}
          style={{
            background: '#916B5E',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 6,
          }}
        >
          完了
        </button>
      </div>
    </div>
  );
};

export default Canvas;
