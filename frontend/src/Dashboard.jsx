import { useState } from 'react'
import { Link } from 'react-router-dom'
import UploadImage from './UploadImage.jsx'
import './Dashboard.css'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const todayUploads = 0
  const totalUploads = 0

  return (
    <div className="dashboard-root">
      {/* 상단 네비게이션 바 */}
      <header className="dashboard-navbar">
        <div className="navbar-logo">Ocean Clean AI</div>
      </header>

      <div className="dashboard-body">
        {/* 왼쪽 사이드바 */}
        <aside className="dashboard-sidebar">
          <ul>
            <li><button className={`sidebar-link${activeTab === 'dashboard' ? ' active' : ''}`} onClick={() => setActiveTab('dashboard')}>대시보드</button></li>
            <li><button className={`sidebar-link${activeTab === 'upload' ? ' active' : ''}`} onClick={() => setActiveTab('upload')}>업로드 하러 가기</button></li>
            <li><button className={`sidebar-link${activeTab === 'upload' ? ' active' : ''}`} onClick={() => setActiveTab('upload')}>지도</button></li>
          </ul>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="dashboard-main">
        <div className="dashboard-stats">
                  <div className="stat-box">
                    <span className="stat-label">오늘 업로드</span>
                    <span className="stat-value">{todayUploads}건</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">전체 업로드</span>
                    <span className="stat-value">{totalUploads}건</span>
                  </div>
                </div>
          <div className="main-content-box">
         
            {activeTab === 'dashboard' && (
              <>
                
                <div className="dashboard-info">
                  <p>여기에 앞으로 다양한 통계, 최근 업로드, 알림, 메뉴 등을 추가할 수 있습니다.</p>
                </div>
              </>
            )}
            {activeTab === 'upload' && (
              <UploadImage />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard 