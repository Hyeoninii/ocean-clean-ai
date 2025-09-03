import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DataPage from './pages/DataPage';
import MapPage from './pages/MapPage';
import UploadPage from './pages/UploadPage';
import TestPage from './pages/TestPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🌊 Ocean Clean AI
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">홈</Link>
              </li>
              <li className="nav-item">
                <Link to="/data" className="nav-link">데이터 현황</Link>
              </li>
              <li className="nav-item">
                <Link to="/map" className="nav-link">지도</Link>
              </li>
              <li className="nav-item">
                <Link to="/upload" className="nav-link">업로드</Link>
              </li>
              <li className="nav-item">
                <Link to="/test" className="nav-link">테스트</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/test" element={<TestPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>해양 보호의 첫걸음, Ocean Clean AI</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;