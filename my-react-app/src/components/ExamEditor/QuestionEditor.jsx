import React, { useRef, useState, useEffect } from 'react';
import { 
  Trash2, 
  Upload, 
  Volume2, 
  Image as ImageIcon,
  X,
  Loader,
  Play,
  Pause
} from 'lucide-react';
import CloudinaryService from '../../services/CloudinaryService';

const QuestionEditor = ({
  question,
  questionIndex,
  partIndex,
  onUpdateQuestion,
  onDeleteQuestion,
  onFileUpload,
  uploadingFiles
}) => {
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const audioRef = useRef(null);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        CloudinaryService.revokePreviewUrl(imagePreview);
      }
      if (audioPreview && audioPreview.startsWith('blob:')) {
        CloudinaryService.revokePreviewUrl(audioPreview);
      }
    };
  }, [imagePreview, audioPreview]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file trước khi upload
      CloudinaryService.validateFile(file, 'image');
      
      // Tạo preview URL cho UX tốt hơn
      const previewUrl = CloudinaryService.generatePreviewUrl(file);
      setImagePreview(previewUrl);
      
      // Gửi file lên để xử lý
      await onFileUpload(file, 'image', questionIndex);
    } catch (error) {
      console.error('Lỗi khi xử lý file ảnh:', error);
      alert(error.message);
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file trước khi upload
      CloudinaryService.validateFile(file, 'audio');
      
      // Tạo preview URL cho UX tốt hơn
      const previewUrl = CloudinaryService.generatePreviewUrl(file);
      setAudioPreview(previewUrl);
      
      // Gửi file lên để xử lý
      await onFileUpload(file, 'audio', questionIndex);
    } catch (error) {
      console.error('Lỗi khi xử lý file âm thanh:', error);
      alert(error.message);
    }
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      CloudinaryService.revokePreviewUrl(imagePreview);
    }
    setImagePreview(null);
    onUpdateQuestion(questionIndex, 'imageUrl', null);
  };

  const removeAudio = () => {
    if (audioPreview && audioPreview.startsWith('blob:')) {
      CloudinaryService.revokePreviewUrl(audioPreview);
    }
    setAudioPreview(null);
    setIsPlaying(false);
    onUpdateQuestion(questionIndex, 'audioUrl', null);
  };

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const isUploadingImage = uploadingFiles[`${partIndex}-${questionIndex}-image`];
  const isUploadingAudio = uploadingFiles[`${partIndex}-${questionIndex}-audio`];

  // Use preview or uploaded URL
  const displayImageUrl = imagePreview || question.imageUrl;
  const displayAudioUrl = audioPreview || question.audioUrl;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
            Câu {question.questionOrder}
          </span>
          <select
            value={question.questionType}
            onChange={(e) => onUpdateQuestion(questionIndex, 'questionType', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
            <option value="FILL_BLANK">Điền từ</option>
            <option value="LISTENING">Nghe</option>
            <option value="READING">Đọc hiểu</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={question.points}
            onChange={(e) => onUpdateQuestion(questionIndex, 'points', parseInt(e.target.value))}
            min="1"
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Điểm số"
          />
          <span className="text-sm text-gray-500">điểm</span>
          <button
            onClick={() => onDeleteQuestion(questionIndex)}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Xóa câu hỏi"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung câu hỏi *
          </label>
          <textarea
            value={question.questionText}
            onChange={(e) => onUpdateQuestion(questionIndex, 'questionText', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập nội dung câu hỏi"
          />
        </div>

        {/* Media Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh
            </label>
            {displayImageUrl ? (
              <div className="relative">
                <img 
                  src={displayImageUrl} 
                  alt="Question" 
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  title="Xóa ảnh"
                >
                  <X size={12} />
                </button>
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader className="animate-spin mx-auto mb-2" size={24} />
                      <span className="text-sm">Đang upload...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-colors disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <Loader className="animate-spin mb-2" size={24} />
                  ) : (
                    <ImageIcon className="mb-2 text-gray-400" size={24} />
                  )}
                  <span className="text-sm text-gray-500">
                    {isUploadingImage ? 'Đang upload...' : 'Nhấn để upload ảnh'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    JPG, PNG, GIF (tối đa 5MB)
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File âm thanh
            </label>
            {displayAudioUrl ? (
              <div className="relative">
                <div className="p-4 border border-gray-300 rounded-lg bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={toggleAudioPlayback}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Audio File</div>
                      <div className="text-xs text-gray-500">Nhấn play để nghe thử</div>
                    </div>
                    <button
                      onClick={removeAudio}
                      className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      title="Xóa audio"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <audio
                    ref={audioRef}
                    src={displayAudioUrl}
                    onEnded={handleAudioEnded}
                    className="w-full"
                    controls
                  />
                </div>
                {isUploadingAudio && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader className="animate-spin mx-auto mb-2" size={24} />
                      <span className="text-sm">Đang upload...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleAudioUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <button
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isUploadingAudio}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-colors disabled:opacity-50"
                >
                  {isUploadingAudio ? (
                    <Loader className="animate-spin mb-2" size={24} />
                  ) : (
                    <Volume2 className="mb-2 text-gray-400" size={24} />
                  )}
                  <span className="text-sm text-gray-500">
                    {isUploadingAudio ? 'Đang upload...' : 'Nhấn để upload audio'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    MP3, WAV, M4A (tối đa 20MB)
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Các lựa chọn
          </label>
          <textarea
            value={question.option}
            onChange={(e) => onUpdateQuestion(questionIndex, 'option', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A) Lựa chọn 1 B) Lựa chọn 2 C) Lựa chọn 3 D) Lựa chọn 4"
          />
        </div>

        {/* Correct Answer and Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đáp án đúng *
            </label>
            <input
              type="text"
              value={question.correctAnswer}
              onChange={(e) => onUpdateQuestion(questionIndex, 'correctAnswer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giải thích
            </label>
            <input
              type="text"
              value={question.explanation || ''}
              onChange={(e) => onUpdateQuestion(questionIndex, 'explanation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Giải thích đáp án"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;



