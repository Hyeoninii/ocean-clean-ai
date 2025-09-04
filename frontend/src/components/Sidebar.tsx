import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          🌊 Ocean Clean AI
        </div>
        <div className="sidebar-toggle">
          {'<<'}
        </div>
      </div>
      
      <div className="sidebar-menu">
        <nav className="nav-items">
          <Link 
            to="/" 
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
          >
            <span className="nav-indicator"></span>
            <span className="nav-text">홈</span>
          </Link>
          
          <Link 
            to="/data" 
            className={`nav-item ${isActive('/data') ? 'active' : ''}`}
          >
            <span className="nav-indicator"></span>
            <span className="nav-text">쓰레기 현황</span>
          </Link>
          
          <Link 
            to="/map" 
            className={`nav-item ${isActive('/map') ? 'active' : ''}`}
          >
            <span className="nav-indicator"></span>
            <span className="nav-text">위험도 지도</span>
          </Link>
          
          <Link 
            to="/upload" 
            className={`nav-item ${isActive('/upload') ? 'active' : ''}`}
          >
            <span className="nav-indicator"></span>
            <span className="nav-text">이미지 업로드</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
