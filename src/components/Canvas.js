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

  // タブ状態：id, name, dataURL(画像)
  const [tabs, setTabs] = useState(() =>
    normalizedImages.map((img, i) => ({
      id: Date.now() + i,
      name: (i + 1).toString(),
      dataURL: img,
    }))
  );

  // アクティブなタブ
  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);

  // 外部のinitialTabIndex変化に対応
  useEffect(() => {
    setActiveTabIndex(initialTabIndex);
  }, [initialTabIndex]);

  // 描画履歴（Undo用）
  const [history, setHistory] = useState([]);
  // Redo用履歴スタック
  const [redoStack, setRedoStack] = useState([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);

  const canvasRef = useRef(null);

  const currentTab = tabs[activeTabIndex];

  // タブ切替時にCanvasに描画する
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

        // 描画履歴はリセットせず、履歴がなければ初期状態をセット
        setHistory((h) => (h.length === 0 ? [canvas.toDataURL()] : h));
        //setRedoStack([]);
      };
      img.src = currentTab.dataURL;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHistory((h) => (h.length === 0 ? [canvas.toDataURL()] : h));
      //setRedoStack([]);
    }
  }, [activeTabIndex, currentTab.dataURL]);

  // マウス位置取得
  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 描画開始
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    setLastPos(getMousePos(e));
  };

  // 描画中
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

  // 描画終了
  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasToTab();
  };

  // Canvas内容を現在タブに保存＆履歴に追加
  const saveCanvasToTab = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();

    setTabs((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = { ...updated[activeTabIndex], dataURL };
      return updated;
    });

    setHistory((prev) => {
      const newHistory = [...prev, dataURL];
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });

    //setRedoStack([]);
  };

  // Canvasに描画（画像復元）
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

  // Undo処理
  const handleUndo = async () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    const last = newHistory.pop();
    setRedoStack((prev) => [last, ...prev]);
    console.log(redoStack);

    const prevDataURL = newHistory[newHistory.length - 1];
    await restoreCanvas(prevDataURL);

    setTabs((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = { ...updated[activeTabIndex], dataURL: prevDataURL };
      return updated;
    });

    setHistory(newHistory);
    
  };

  // Redo処理
  const handleRedo = async () => {
    if (redoStack.length === 0) return;
    const [first, ...rest] = redoStack;
    await restoreCanvas(first);

    setTabs((prev) => {
      const updated = [...prev];
      updated[activeTabIndex] = { ...updated[activeTabIndex], dataURL: first };
      return updated;
    });

    setHistory((prev) => [...prev, first]);
    setRedoStack(rest);
  };

  // Canvasクリア
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvasToTab();
  };

  // 画像アップロードしてCanvasに描画
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

  // 完了ボタンで親へ更新を伝える
  const handleSave = () => {
    setRedoStack([]);
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

      {/* Canvas本体 */}
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

      {/* ツール選択など */}
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
        <button onClick={handleUndo} disabled={history.length <= 1 || isDrawing}>
          Undo
        </button>
        <button onClick={handleRedo} disabled={redoStack.length === 0 || isDrawing} style={{ marginLeft: 10 }}>
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

      {/* キャンセル・完了 */}
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
