export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const pdfTypes = ['pdf'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (pdfTypes.includes(extension)) return 'pdf';
  return 'other';
};

export const isValidFileType = (file) => {
  const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  return validTypes.includes(file.type);
};

