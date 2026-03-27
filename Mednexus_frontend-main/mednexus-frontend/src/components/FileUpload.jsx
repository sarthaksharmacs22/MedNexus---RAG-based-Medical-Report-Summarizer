import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { formatFileSize, getFileType } from '../utils/fileUtils';
import { summarizeReport } from '../services/api';

const FileUpload = ({ onFileUploaded, onUploadProgress }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();

  const onDrop = useCallback(async (acceptedFiles) => {
    // ✅ FIXED: Sequential processing (no async forEach race condition)
    for (const file of acceptedFiles) {
      const fileId = Date.now() + Math.random();
      const fileData = {
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        type: getFileType(file.name),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      };

      setUploadedFiles((prev) => [...prev, fileData]);
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      try {
        // Simulate progress stages
        setUploadProgress((prev) => ({ ...prev, [fileId]: 33 }));
        
        const res = await summarizeReport(file);
        setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
        
        const updatedFile = {
          ...fileData,
          summary: res.summary,
        };

        // Update UI state
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? updatedFile : f))
        );

        onFileUploaded?.(updatedFile);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress((prev) => ({ ...prev, [fileId]: -1 }));
      }
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
    setUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <FiImage className="w-6 h-6" />;
      case 'pdf':
        return <FiFileText className="w-6 h-6" />;
      default:
        return <FiFile className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive
            ? 'border-orange-500 dark:border-orange-400 bg-orange-500/10 dark:bg-orange-400/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          glass
        `}
        style={isDragActive ? {
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}10`,
        } : {}}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className={`p-4 rounded-full bg-gradient-to-r ${colors.gradient} text-slate-900 dark:text-white`}>
            <FiUpload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              or click to browse (PDF, PNG, JPG - Max 10MB)
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            {uploadedFiles.map((fileData) => (
              <motion.div
                key={fileData.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-strong rounded-xl p-4"
              >
                <div className="flex items-center space-x-4">
                  {/* Preview or Icon */}
                  {fileData.preview ? (
                    <img
                      src={fileData.preview}
                      alt={fileData.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-slate-900 dark:text-white`}>
                      {getFileIcon(fileData.type)}
                    </div>
                  )}

                  {/* ✅ FIXED: Clean JSX structure - NO duplicates */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {fileData.name}
                    </p>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileData.size)}
                    </p>

                    {/* ✅ Medical Summary - Beautiful styling */}
                    {fileData.summary && (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                            {fileData.summary}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {uploadProgress[fileData.id] !== undefined && (
                      <div className="mt-3">
                        {uploadProgress[fileData.id] >= 0 ? (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress[fileData.id]}%` }}
                              className={`h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-red-500">Upload failed</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;