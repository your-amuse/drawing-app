import React, { useState } from 'react';
import './HamburgerMenu.css';

const HamburgerMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        className="hamburger-button"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="hamburger-text">menu</span>
      </button>

      <nav className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={toggleMenu} aria-label="Close menu">
          &times;
        </button>
        <div className="menu-content">
          {children}
        </div>
      </nav>

      {/* メニュー開いてる時の背景オーバーレイ */}
      {isOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
    </>
  );
};

export default HamburgerMenu;
