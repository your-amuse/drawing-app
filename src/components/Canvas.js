import React, { useRef, useState, useEffect } from 'react';
import { useOrder } from '../OrderContext';

const MAX_TABS = 4;
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
  const [histories, setHistories] = useState(() => Array(MAX_TABS).fill().map(() => []));
  const [redos, setRedos] = useState(() => Array(MAX_TABS).fill().map(() => []));

  const [canvasSize, setCanvasSize] = useState(600);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // 判定: coarseは指操作のタッチ端末（スマホ・タブレット）
  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const resizeCanvasToImage = (img) => {
    const maxSide = Math.max(img.width, img.height);
    const size = Math.min(Math.max(maxSide, 300), 1200);
    setCanvasSize(size);
  };

  useEffect(() => setActiveTabIndex(initialTabIndex), [initialTabIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const drawImage = (src) => {
      const img = new Image();
      img.onload = () => {
        resizeCanvasToImage(img);
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const ox = (canvas.width - w) / 2;
        const oy = (canvas.height - h) / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, ox, oy, w, h);
        setHistories(prev => {
          const copy = [...prev];
          if (!copy[activeTabIndex]?.length) copy[activeTabIndex] = [canvas.toDataURL()];
          return copy;
        });
      };
      img.src = src;
    };

    const current = tabs[activeTabIndex];
    if (current?.dataURL) drawImage(current.dataURL);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [activeTabIndex, tabs, canvasSize]);

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvasRef.current.width / r.width),
      y: (e.clientY - r.top) * (canvasRef.current.height / r.height),
    };
  };

  const handlePointerDown = e => {
    e.preventDefault();
    setIsDrawing(true);
    setLastPos(getPos(e));
  };

  const handlePointerMove = e => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const np = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(np.x, np.y);
    ctx.strokeStyle = tool === 'eraser' ? '#fff' : color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    setLastPos(np);
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvas();
    }
  };

  const handlePointerLeave = () => handlePointerUp();

  const saveCanvas = () => {
    const dataURL = canvasRef.current.toDataURL();
    setTabs(prev => {
      const u = [...prev];
      u[activeTabIndex] = { ...u[activeTabIndex], dataURL };
      return u;
    });
    setHistories(prev => {
      const u = [...prev];
      const h = [...u[activeTabIndex], dataURL];
      if (h.length > MAX_HISTORY) h.shift();
      u[activeTabIndex] = h;
      return u;
    });
    setRedos(prev => {
      const u = [...prev];
      u[activeTabIndex] = [];
      return u;
    });
  };

  const restoreCanvas = (dataURL) => new Promise(resolve => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const ox = (canvas.width - w) / 2;
      const oy = (canvas.height - h) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, ox, oy, w, h);
      resolve();
    };
    img.src = dataURL;
  });

  const handleUndo = async () => {
    const h = histories[activeTabIndex];
    if (h.length <= 1) return;
    const h2 = [...h];
    const last = h2.pop();
    setRedos(prev => {
      const u = [...prev];
      u[activeTabIndex] = [last, ...u[activeTabIndex]];
      return u;
    });
    const prevURL = h2[h2.length - 1];
    await restoreCanvas(prevURL);
    setTabs(prev => {
      const u = [...prev];
      u[activeTabIndex] = { ...u[activeTabIndex], dataURL: prevURL };
      return u;
    });
    setHistories(prev => {
      const u = [...prev];
      u[activeTabIndex] = h2;
      return u;
    });
  };

  const handleRedo = async () => {
    const stack = redos[activeTabIndex];
    if (!stack.length) return;
    const [first, ...rest] = stack;
    await restoreCanvas(first);
    setTabs(prev => {
      const u = [...prev];
      u[activeTabIndex] = { ...u[activeTabIndex], dataURL: first };
      return u;
    });
    setHistories(prev => {
      const u = [...prev];
      u[activeTabIndex] = [...u[activeTabIndex], first];
      return u;
    });
    setRedos(prev => {
      const u = [...prev];
      u[activeTabIndex] = rest;
      return u;
    });
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveCanvas();
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        resizeCanvasToImage(img);
        const ctx = canvasRef.current.getContext('2d');
        const scale = Math.min(canvasRef.current.width / img.width, canvasRef.current.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const ox = (canvasRef.current.width - w) / 2;
        const oy = (canvasRef.current.height - h) / 2;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, ox, oy, w, h);
        saveCanvas();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{
      position: 'relative',
      width: '90vw',
      maxWidth: 800,
      height: '90vh',
      maxHeight: 800,
      margin: 'auto',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: 12,
    }}>
      {/* 完了・キャンセルボタンの位置（タッチ端末なら右上、それ以外は右下） */}
      <div style={{
        position: 'absolute',
        ...(isTouchDevice ? { top: 10, right: 10 } : { bottom: 10, right: 10 }),
        display: 'flex',
        gap: 12,
        zIndex: 1000,
      }}>
        <button onClick={onCancel} disabled={isDrawing}
          style={{ background: '#ccc', padding: '6px 12px', borderRadius: 6 }}>
          キャンセル
        </button>
        <button onClick={() => onSave(tabs)} disabled={isDrawing}
          style={{ background: '#916B5E', color: '#fff', padding: '6px 12px', borderRadius: 6 }}>
          完了
        </button>
      </div>

      {/* タブボタン */}
      <div style={{ margin: '10px 0 8px', textAlign: 'center' }}>
        {tabs.map((tab, idx) => (
          <button key={tab.id} onClick={() => setActiveTabIndex(idx)} disabled={isDrawing}
            style={{
              marginRight: 6,
              padding: '4px 8px',
              fontWeight: idx === activeTabIndex ? 'bold' : 'normal',
              background: idx === activeTabIndex ? '#f0e7e3' : '#fff',
              borderRadius: 4,
              border: '1px solid #ccc',
              cursor: isDrawing ? 'not-allowed' : 'pointer',
            }}>
            {tab.name}
          </button>
        ))}
      </div>

      {/* キャンバス領域 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        border: '1px solid #aaa',
        borderRadius: 10,
        margin: '0 auto 10px',
        position: 'relative',
        touchAction: 'none',
      }}>
        <canvas ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{
            display: 'block',
            borderRadius: 10,
            cursor: 'crosshair',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        />
      </div>

      {/* ツールバー */}
      <div style={{
        padding: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
      }}>
        <select value={tool} onChange={e => setTool(e.target.value)} disabled={isDrawing}>
          <option value="pen">✏️ ペン</option>
          <option value="eraser">🧽 消しゴム</option>
        </select>
        <input type="color" value={color} disabled={tool === 'eraser' || isDrawing}
          onChange={e => setColor(e.target.value)} />
        <input type="range" min="1" max="10" value={lineWidth}
          onChange={e => setLineWidth(Number(e.target.value))} disabled={isDrawing} />
        <button onClick={handleUndo} disabled={isDrawing || histories[activeTabIndex].length <= 1}>↩️</button>
        <button onClick={handleRedo} disabled={isDrawing || redos[activeTabIndex].length === 0}>↪️</button>
        <button onClick={clearCanvas} disabled={isDrawing}>🗑️</button>
        <label style={{ cursor: 'pointer', background: '#ddd', padding: '6px 10px', borderRadius: 6 }}>
          📷 画像アップロード
          <input type="file" accept="image/*"
            onChange={handleImageUpload} disabled={isDrawing} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
};

export default Canvas;
