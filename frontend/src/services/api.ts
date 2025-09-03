import axios from 'axios';
import { WasteData, WasteDataFilter, WasteDataStatistics, UploadResponse, HomeData } from '../types/WasteData';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const wasteDataApi = {
  // 모든 쓰레기 데이터 조회
  getAllWasteData: async (): Promise<WasteData[]> => {
    const response = await api.get('/waste-data');
    return response.data;
  },

  // 페이지네이션으로 쓰레기 데이터 조회
  getWasteDataWithPagination: async (page: number = 0, size: number = 20) => {
    const response = await api.get(`/waste-data/page?page=${page}&size=${size}`);
    return response.data;
  },

  // 필터링된 쓰레기 데이터 조회
  getFilteredWasteData: async (filter: WasteDataFilter): Promise<WasteData[]> => {
    const params = new URLSearchParams();
    if (filter.label) params.append('label', filter.label);
    if (filter.riskLevel) params.append('riskLevel', filter.riskLevel);
    
    const response = await api.get(`/waste-data/filter?${params.toString()}`);
    return response.data;
  },

  // 고유 라벨 목록 조회
  getDistinctLabels: async (): Promise<string[]> => {
    const response = await api.get('/waste-data/labels');
    return response.data;
  },

  // 통계 정보 조회
  getStatistics: async (): Promise<WasteDataStatistics> => {
    const response = await api.get('/waste-data/statistics');
    return response.data;
  },

  // 이미지 업로드 및 분석
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/waste-data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // YOLO 서비스 상태 확인
  getYOLOStatus: async () => {
    const response = await api.get('/waste-data/yolo-status');
    return response.data;
  },
};

export const homeApi = {
  // 홈 데이터 조회
  getHomeData: async (): Promise<HomeData> => {
    const response = await api.get('/home');
    return response.data;
  },
};

export default api;
