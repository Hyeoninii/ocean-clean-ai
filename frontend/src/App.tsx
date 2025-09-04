import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import DataPage from './pages/DataPage';
import MapPage from './pages/MapPage';
import UploadPage from './pages/UploadPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        
        <div className="main-wrapper">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/data" element={<DataPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/upload" element={<UploadPage />} />
            </Routes>
          </main>

          <footer className="footer">
            <p>해양 보호의 첫걸음, Ocean Clean AI</p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;