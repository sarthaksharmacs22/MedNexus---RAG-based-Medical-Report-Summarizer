import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// File upload service
export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      }
    },
  });
};

// OCR service
export const getOCRText = async (fileId) => {
  return api.get(`/ocr/${fileId}`);
};

// Ask question service
export const askQuestion = async (question, fileId = null) => {
  return api.post('/ask', {
    question,
    file_id: fileId,
  });
};

// RAG service
export const getRAGAnswer = async (question, fileId = null) => {
  return api.post('/rag', {
    question,
    file_id: fileId,
  });
};

export default api;

export const summarizeReport = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/summarize', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};