package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	UploadFolder = "uploads"
	MaxFileSize  = 10 * 1024 * 1024 // 10MB
)

var allowedExtensions = map[string]bool{
	".png":  true,
	".jpg":  true,
	".jpeg": true,
	".gif":  true,
	".bmp":  true,
	".webp": true,
}

type FileInfo struct {
	Filename     string    `json:"filename"`
	OriginalName string    `json:"originalName"`
	Size         float64   `json:"size"`
	Path         string    `json:"path"`
	UploadDate   time.Time `json:"uploadDate"`
}

type ImageInfo struct {
	Filename   string    `json:"filename"`
	Size       float64   `json:"size"`
	UploadDate time.Time `json:"uploadDate"`
}

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func main() {
	// 업로드 폴더 생성
	if err := os.MkdirAll(UploadFolder, 0755); err != nil {
		log.Fatal("업로드 폴더 생성 실패:", err)
	}

	// Gin 라우터 설정
	r := gin.Default()

	// CORS 설정
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// 정적 파일 서빙 (업로드된 이미지)
	r.Static("/uploads", "./uploads")

	// API 라우트
	api := r.Group("/api")
	{
		api.GET("/health", healthCheck)
		api.POST("/upload-image", uploadImage)
		api.GET("/images", getImages)
		api.DELETE("/delete-image/:filename", deleteImage)
	}

	// 루트 엔드포인트
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Ocean Clean AI API 서버가 실행 중입니다!",
		})
	})

	fmt.Println("Go 서버가 시작됩니다...")
	fmt.Printf("업로드 디렉토리: %s\n", getAbsPath(UploadFolder))
	fmt.Println("서버 주소: http://localhost:3333")

	// 서버 시작
	if err := r.Run(":3333"); err != nil {
		log.Fatal("서버 시작 실패:", err)
	}
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "서버가 정상적으로 실행 중입니다.",
		Data: gin.H{
			"timestamp": time.Now().Format(time.RFC3339),
		},
	})
}

func uploadImage(c *gin.Context) {
	// 파일 크기 제한 설정
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxFileSize)

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Message: "이미지 파일을 찾을 수 없습니다.",
		})
		return
	}
	defer file.Close()

	// 파일 확장자 검사
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExtensions[ext] {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Message: "지원하지 않는 파일 형식입니다. (png, jpg, jpeg, gif, bmp, webp만 허용)",
		})
		return
	}

	// 고유한 파일명 생성
	uniqueID := uuid.New().String()
	filename := fmt.Sprintf("image-%s%s", uniqueID, ext)
	filePath := filepath.Join(UploadFolder, filename)

	// 파일 생성
	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Success: false,
			Message: "파일 생성 중 오류가 발생했습니다.",
		})
		return
	}
	defer dst.Close()

	// 파일 복사
	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Success: false,
			Message: "파일 저장 중 오류가 발생했습니다.",
		})
		return
	}

	// 파일 정보 수집
	fileInfo, err := dst.Stat()
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Success: false,
			Message: "파일 정보를 가져올 수 없습니다.",
		})
		return
	}

	fileSize := float64(fileInfo.Size()) / (1024 * 1024) // MB로 변환

	response := FileInfo{
		Filename:     filename,
		OriginalName: header.Filename,
		Size:         fileSize,
		Path:         filePath,
		UploadDate:   time.Now(),
	}

	fmt.Printf("이미지 업로드 성공: %+v\n", response)

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "이미지가 성공적으로 업로드되었습니다.",
		Data:    response,
	})
}

func getImages(c *gin.Context) {
	files, err := os.ReadDir(UploadFolder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Success: false,
			Message: "이미지 목록을 가져올 수 없습니다.",
		})
		return
	}

	var images []ImageInfo
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		ext := strings.ToLower(filepath.Ext(file.Name()))
		if !allowedExtensions[ext] {
			continue
		}

		filePath := filepath.Join(UploadFolder, file.Name())
		fileInfo, err := os.Stat(filePath)
		if err != nil {
			continue
		}

		fileSize := float64(fileInfo.Size()) / (1024 * 1024) // MB로 변환

		images = append(images, ImageInfo{
			Filename:   file.Name(),
			Size:       fileSize,
			UploadDate: fileInfo.ModTime(),
		})
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "이미지 목록을 성공적으로 가져왔습니다.",
		Data:    images,
	})
}

func deleteImage(c *gin.Context) {
	filename := c.Param("filename")
	if filename == "" {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Message: "파일명이 필요합니다.",
		})
		return
	}

	filePath := filepath.Join(UploadFolder, filename)

	// 파일 존재 여부 확인
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, Response{
			Success: false,
			Message: "파일을 찾을 수 없습니다.",
		})
		return
	}

	// 파일 삭제
	if err := os.Remove(filePath); err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Success: false,
			Message: "파일 삭제 중 오류가 발생했습니다.",
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "이미지가 성공적으로 삭제되었습니다.",
	})
}

func getAbsPath(path string) string {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return path
	}
	return absPath
}
