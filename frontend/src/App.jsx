import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
      setUploadResult(null)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedImage) {
      alert('먼저 이미지를 선택해주세요!')
      return
    }
    setIsUploading(true)
    setUploadResult(null)
    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      const response = await fetch('http://localhost:3333/api/upload-image', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (result.success) {
        setUploadResult({
          type: 'success',
          message: result.message,
          filename: result.filename
        })
        alert('이미지가 성공적으로 업로드되었습니다!')
      } else {
        setUploadResult({
          type: 'error',
          message: result.message
        })
        alert(`업로드 실패: ${result.message}`)
      }
    } catch (error) {
      console.error('업로드 에러:', error)
      setUploadResult({
        type: 'error',
        message: '서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.'
      })
      alert('서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>사진 업로드 페이지</h1>
        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              ref={fileInputRef}
              id="image-input"
              className="file-input"
            />
            <label htmlFor="image-input" className="file-input-label">
              📷 이미지 선택하기
            </label>
          </div>
          {selectedImage && (
            <div className="file-info">
              <p>선택된 파일: {selectedImage.name}</p>
              <p>파일 크기: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
        {previewUrl && (
          <div className="preview-section">
            <h3>미리보기</h3>
            <div className="image-preview">
              <img src={previewUrl} alt="미리보기" />
            </div>
          </div>
        )}
        {uploadResult && (
          <div className={`upload-result ${uploadResult.type}`}>
            <h3>{uploadResult.type === 'success' ? '✅ 업로드 성공' : '❌ 업로드 실패'}</h3>
            <p>{uploadResult.message}</p>
            {uploadResult.filename && (
              <p>저장된 파일명: {uploadResult.filename}</p>
            )}
          </div>
        )}
        <div className="button-section">
          <button 
            onClick={handleUpload} 
            className="upload-btn"
            disabled={!selectedImage || isUploading}
          >
            {isUploading ? '업로드 중...' : '업로드'}
          </button>
          <button 
            onClick={handleClear} 
            className="clear-btn"
            disabled={!selectedImage}
          >
            초기화
          </button>
        </div>
        <div className="server-info">
          <p>💡 서버가 실행되지 않은 경우: <code>go run main.go</code> 명령어로 백엔드 서버를 시작하세요</p>
        </div>
      </div>
    </div>
  )
}

export default App
