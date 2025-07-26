import React, { useRef, useState, useEffect } from 'react';
import { useOrder } from '../OrderContext';

const MAX_TABS = 5;
const MAX_HISTORY = 40;

const Canvas = ({ onCancel, onSave, initialTabIndex = 0 }) => {
  const { orderData } = useOrder();

  // 画像配列を正規化（5枚まで）
  const normalizedImages = Array.isArray(orderData.images)
    ? [...orderData.images]
    : [];
  while (normalizedImages.length < MAX_TABS) {
    normalizedImages.push(null);
  }

  // タブ状態
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

  // タブごとの history / redoStack を保持
  const [histories, setHistories] = useState(() =>
    Array(MAX_TABS).fill().map(() => [])
  );
  const [redos, setRedos] = useState(() =>
    Array(MAX_TABS).fill().map(() => [])
  );

  const currentTab = tabs[activeTabIndex];

  // 画面高さに合わせたcanvas高さをstateで管理（リサイズ対応）
  const [canvasHeight, setCanvasHeight] = useState(() =>
    Math.floor(window.innerHeight * 0.5)
  );
  useEffect(() => {
    const handleResize = () => {
      setCanvasHeight(Math.floor(window.innerHeight * 0.6));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setActiveTabIndex(initialTabIndex);
  }, [initialTabIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (currentTab?.dataURL) {
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
      img.src = currentTab.dataURL;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHistories((prev) => {
        const updated = [...prev];
        if (updated[activeTabIndex].length === 0) {
          updated[activeTabIndex] = [canvas.toDataURL()];
        }
        return updated;
      });
    }
  }, [activeTabIndex, currentTab.dataURL, canvasHeight]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    setLastPos(getMousePos(e));
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const newPos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(newPos.x, newPos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    setLastPos(newPos);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasToTab();
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
      const newHistory = [...updated[activeTabIndex], dataURL];
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      updated[activeTabIndex] = newHistory;
      return updated;
    });

    setRedos((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = [];
      return updated;
    });
  };

  const restoreCanvas = (dataURL) => {
    return new Promise((resolve) => {
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
  };

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
    const redo = redos[activeTabIndex];
    if (redo.length === 0) return;

    const [first, ...rest] = redo;
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvasToTab();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveCanvasToTab();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // インラインスタイルまとめ
  const modalStyle = {
  height: '90vh',
  maxWidth: 900,
  padding: 20,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  borderRadius: 12,
  overflow: 'hidden', // はみ出し対策
};

  const canvasContainerStyle = {
  border: '1px solid #916B5E',
  borderRadius: 10,
  boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
  margin: '10px 0 10px 0', // 上下マージンを狭く
  width: 600,
  height: canvasHeight,
  display: 'block',
  flexShrink: 0,
};

  const canvasStyle = {
    flexGrow: 1,
    borderRadius: 10,
    display: 'block',
    width: '100%',
    height: '100%',
    cursor: 'crosshair',
  };

  const toolAreaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 10,
  flexWrap: 'wrap',
  fontSize: '0.9rem',
};

  const actionButtonsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
  };

  return (
    <div style={modalStyle}>
      {/* タブ切替 */}
      <div style={{ marginBottom: 10 }}>
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabIndex(idx)}
            style={{
              fontWeight: idx === activeTabIndex ? 'bold' : 'normal',
              marginRight: 10,
              minWidth: 30,
              borderRadius: 6,
              border: '1px solid #916B5E',
              backgroundColor: idx === activeTabIndex ? '#f4e8e1' : 'white',
              cursor: isDrawing ? 'not-allowed' : 'pointer',
              padding: '6px 10px',
            }}
            disabled={isDrawing}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div style={canvasContainerStyle}>
        <canvas
          ref={canvasRef}
          width={600}
          height={canvasHeight}
          style={canvasStyle}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* ツール */}
      <div style={toolAreaStyle}>
        <label>
          ツール:
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            style={{ marginLeft: 10, borderRadius: 6, border: '1px solid #916B5E' }}
            disabled={isDrawing}
          >
            <option value="pen">ペン</option>
            <option value="eraser">消しゴム</option>
          </select>
        </label>

        <label>
          色:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={tool === 'eraser' || isDrawing}
            style={{
              marginLeft: 10,
              width: 40,
              height: 30,
              border: '1px solid #916B5E',
              borderRadius: 6,
              padding: 0,
              cursor: tool === 'eraser' || isDrawing ? 'not-allowed' : 'pointer',
            }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center' }}>
          線幅:
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            disabled={isDrawing}
            style={{
              verticalAlign: 'middle',
              marginLeft: 10,
              cursor: isDrawing ? 'not-allowed' : 'pointer',
            }}
          />
          {lineWidth}
        </label>

        {/* Undo, Redo, Clear ボタン */}
        <button
          onClick={handleUndo}
          disabled={histories[activeTabIndex]?.length <= 1 || isDrawing}
          style={{
            marginLeft: 20,
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid #916B5E',
            backgroundColor: 'white',
            cursor:
              histories[activeTabIndex]?.length <= 1 || isDrawing
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={redos[activeTabIndex]?.length === 0 || isDrawing}
          style={{
            marginLeft: 10,
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid #916B5E',
            backgroundColor: 'white',
            cursor:
              redos[activeTabIndex]?.length === 0 || isDrawing
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          Redo
        </button>
        <button
          onClick={clearCanvas}
          disabled={isDrawing}
          style={{
            marginLeft: 10,
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid #916B5E',
            backgroundColor: 'white',
            cursor: isDrawing ? 'not-allowed' : 'pointer',
          }}
        >
          クリア
        </button>

        {/* 画像アップロード */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isDrawing}
          style={{ marginLeft: 20, cursor: isDrawing ? 'not-allowed' : 'pointer' }}
        />
      </div>

      {/* 操作ボタン */}
      <div style={actionButtonsStyle}>
        <button
          onClick={onCancel}
          disabled={isDrawing}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: '1px solid #916B5E',
            backgroundColor: 'white',
            cursor: isDrawing ? 'not-allowed' : 'pointer',
          }}
        >
          キャンセル
        </button>
        <button
          onClick={() => onSave(tabs)}
          disabled={isDrawing}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: '#916B5E',
            color: 'white',
            cursor: isDrawing ? 'not-allowed' : 'pointer',
          }}
        >
          完了
        </button>
      </div>
    </div>
  );
};

export default Canvas;
