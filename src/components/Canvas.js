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
  }, [activeTabIndex, currentTab.dataURL]);

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

  const handleSave = () => {
    const updatedImages = tabs.map((tab) => tab.dataURL || null);
    onSave(updatedImages);
  };

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
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
            }}
            disabled={isDrawing}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        style={{ border: '1px solid black', cursor: 'crosshair', marginBottom: 10 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* ツール */}
      <div style={{ marginBottom: 10 }}>
        <label>
          ツール:
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            style={{ marginLeft: 10 }}
            disabled={isDrawing}
          >
            <option value="pen">ペン</option>
            <option value="eraser">消しゴム</option>
          </select>
        </label>

        <label style={{ marginLeft: 20 }}>
          色:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={tool === 'eraser' || isDrawing}
            style={{ marginLeft: 10 }}
          />
        </label>

        <label style={{ marginLeft: 20 }}>
          線幅:
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            disabled={isDrawing}
            style={{ verticalAlign: 'middle', marginLeft: 10 }}
          />
          {lineWidth}
        </label>
      </div>

      {/* Undo, Redo, Clear */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={handleUndo} disabled={histories[activeTabIndex]?.length <= 1 || isDrawing}>
          Undo
        </button>
        <button onClick={handleRedo} disabled={redos[activeTabIndex]?.length === 0 || isDrawing} style={{ marginLeft: 10 }}>
          Redo
        </button>
        <button onClick={clearCanvas} disabled={isDrawing} style={{ marginLeft: 10 }}>
          クリア
        </button>
      </div>

      {/* 画像アップロード */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isDrawing} />
      </div>

      {/* 操作ボタン */}
      <div>
        <button onClick={onCancel} disabled={isDrawing} style={{ marginRight: 20 }}>
          キャンセル
        </button>
        <button onClick={handleSave} disabled={isDrawing}>
          完了
        </button>
      </div>
    </div>
  );
};

export default Canvas;
