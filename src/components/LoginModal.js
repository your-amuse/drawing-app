// LoginModal.js
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;  // ここで表示を制御

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(getAuth(), email, pass);
      onClose();
      if (onLoginSuccess) onLoginSuccess();
    } catch (e) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    }
  };

  const handleSignupRedirect = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '10px',
        minWidth: '360px',
        maxWidth: '90%',
        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>ログイン</h2>

        <div style={{ marginBottom: '15px' }}>
          <label>メールアドレス</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>パスワード</label><br />
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>

        {error && (
          <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '15px' }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#7d5a50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          ログイン
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '10px' }}>
          アカウントをお持ちでない方は{' '}
          <button
            onClick={handleSignupRedirect}
            style={{
              background: 'none',
              border: 'none',
              color: '#7d5a50',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '0.9rem',
            }}
          >
            こちらから登録
          </button>
        </div>

        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              fontSize: '0.85rem',
              color: '#888',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
