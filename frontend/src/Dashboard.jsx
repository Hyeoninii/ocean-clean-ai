import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  // 예시 통계 (실제 데이터 연동은 추후 구현)
  const todayUploads = 0
  const totalUploads = 0

  return (
    <div className="dashboard-container">
      <h1>메인 대시보드</h1>
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
      <div className="dashboard-actions">
        <Link to="/upload" className="dashboard-upload-btn">이미지 업로드 하러 가기</Link>
      </div>
      <div className="dashboard-info">
        <p>여기에 앞으로 다양한 통계, 최근 업로드, 알림, 메뉴 등을 추가할 수 있습니다.</p>
      </div>
    </div>
  )
}

export default Dashboard 