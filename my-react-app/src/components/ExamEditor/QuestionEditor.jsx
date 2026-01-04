import React, { useRef, useState } from 'react';
import { 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  Headphones,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import examApi from '../../api/examApi';

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  LISTENING: 'Nghe',
  PHOTO_DESCRIPTION: 'Mô tả hình ảnh',
  COMPREHENSION: 'Đọc hiểu'
};

const QuestionEditor = ({
  question,
  questionIndex,
  examType,
  onUpdate,
  onDelete
}) => {
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const [uploading, setUploading] = useState({ image: false, audio: false });

  const handleFieldChange = (field, value) => {
    onUpdate({ ...question, [field]: value });
  };

  const handleOptionChange = (optionIndex, value) => {
    const letters = ['A', 'B', 'C', 'D'];
    const letter = letters[optionIndex];
    
    // Format: thêm prefix, giữ nguyên space giữa các từ
    const formattedValue = value ? `${letter}. ${value}` : '';
    
    const newOptions = [...(question.options || ['', '', '', ''])];
    newOptions[optionIndex] = formattedValue;
    
    // Luôn stringify thành JSON string cho backend
    onUpdate({ 
      ...question, 
      options: newOptions, 
      option: JSON.stringify(newOptions) 
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra câu hỏi phải được lưu trước (có id thật từ database)
    // ID thật phải là number, không phải temporary string ID (temp_xxx)
    if (!question.id || typeof question.id === 'string' || String(question.id).startsWith('temp_')) {
      alert('⚠️ Vui lòng LƯU câu hỏi vào database trước khi upload hình ảnh!\n\n' +
            '📌 Các bước:\n' +
            '1. Điền đầy đủ thông tin câu hỏi\n' +
            '2. Click nút "Lưu" hoặc "Thêm câu hỏi"\n' +
            '3. Đợi backend trả về ID thật\n' +
            '4. Sau đó mới upload media\n\n' +
            'Hiện tại câu hỏi chưa có ID thật từ database.');
      e.target.value = ''; // Reset file input
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (JPG, PNG, GIF)');
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File hình ảnh không được vượt quá 5MB');
      e.target.value = '';
      return;
    }

    setUploading({ ...uploading, image: true });
    try {
      console.log(`📤 Uploading image for question ${question.id}...`);
      const response = await examApi.uploadImageToQuestion(question.id, file);
      console.log('✅ Upload response:', response);
      
      // Backend tự động cập nhật imageUrl vào database và trả về URL
      const imageUrl = response.imageUrl || response.url;
      
      if (!imageUrl) {
        throw new Error('Backend không trả về imageUrl');
      }
      
      // Cập nhật state local
      onUpdate({ ...question, imageUrl });
      alert('✅ Upload hình ảnh thành công!\n\nFile đã được lưu trên Azure Storage.');
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('❌ Có lỗi khi upload hình ảnh:\n\n' + (error.response?.data?.message || error.message));
    } finally {
      setUploading({ ...uploading, image: false });
      e.target.value = ''; // Reset file input
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra câu hỏi phải được lưu trước (có id thật từ database)
    // ID thật phải là number, không phải temporary string ID (temp_xxx)
    if (!question.id || typeof question.id === 'string' || String(question.id).startsWith('temp_')) {
      alert('⚠️ Vui lòng LƯU câu hỏi vào database trước khi upload audio!\n\n' +
            '📌 Các bước:\n' +
            '1. Điền đầy đủ thông tin câu hỏi\n' +
            '2. Click nút "Lưu" hoặc "Thêm câu hỏi"\n' +
            '3. Đợi backend trả về ID thật\n' +
            '4. Sau đó mới upload media\n\n' +
            'Hiện tại câu hỏi chưa có ID thật từ database.');
      e.target.value = ''; // Reset file input
      return;
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Vui lòng chọn file âm thanh (MP3, WAV, OGG)');
      e.target.value = '';
      return;
    }

    // Validate file size (max 20MB for audio)
    if (file.size > 20 * 1024 * 1024) {
      alert('File âm thanh không được vượt quá 20MB');
      e.target.value = '';
      return;
    }

    setUploading({ ...uploading, audio: true });
    try {
      console.log(`🎵 Uploading audio for question ${question.id}...`);
      const response = await examApi.uploadAudioToQuestion(question.id, file);
      console.log('✅ Upload response:', response);
      
      // Backend tự động cập nhật audioUrl vào database và trả về URL
      const audioUrl = response.audioUrl || response.url;
      
      if (!audioUrl) {
        throw new Error('Backend không trả về audioUrl');
      }
      
      // Cập nhật state local
      onUpdate({ ...question, audioUrl });
      alert('✅ Upload âm thanh thành công!\n\nFile đã được lưu trên Azure Storage.');
    } catch (error) {
      console.error('❌ Error uploading audio:', error);
      alert('❌ Có lỗi khi upload âm thanh:\n\n' + (error.response?.data?.message || error.message));
    } finally {
      setUploading({ ...uploading, audio: false });
      e.target.value = ''; // Reset file input
    }
  };

  const removeImage = () => {
    onUpdate({ ...question, imageUrl: null });
  };

  const removeAudio = () => {
    onUpdate({ ...question, audioUrl: null });
  };

  // Parse options if they come as JSON string
  const getOptions = () => {
    if (Array.isArray(question.options)) {
      return question.options;
    }
    if (typeof question.option === 'string') {
      try {
        return JSON.parse(question.option);
      } catch {
        return ['', '', '', ''];
      }
    }
    return ['', '', '', ''];
  };

  const options = getOptions();

  // Kiểm tra xem câu hỏi đã được lưu vào database chưa
  const isSaved = question.id && !String(question.id).startsWith('temp_');
  const canUploadMedia = isSaved;

  return (
    <div className={`border-2 rounded-lg p-4 ${
      isSaved ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <h5 className="font-medium text-gray-900">Câu {questionIndex + 1}</h5>
          {isSaved ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full" title="Câu hỏi đã được lưu vào database">
              <Check size={12} />
              Đã lưu
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full" title="Câu hỏi chưa được lưu. Click 'Lưu bài thi' để lưu.">
              <AlertCircle size={12} />
              Chưa lưu
            </span>
          )}
        </div>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
          title="Xóa câu hỏi"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại câu hỏi
          </label>
          <select
            value={question.questionType || 'MULTIPLE_CHOICE'}
            onChange={(e) => handleFieldChange('questionType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {Object.entries(QUESTION_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung câu hỏi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={question.questionText || ''}
            onChange={(e) => handleFieldChange('questionText', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Nhập nội dung câu hỏi"
          />
        </div>

        {/* Media Upload Buttons */}
        <div className="space-y-2">
          {!canUploadMedia && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-800">
                <strong>Lưu ý:</strong> Bạn cần <strong>lưu bài thi</strong> trước khi upload hình ảnh/audio.
                Click nút <strong>"Lưu bài thi"</strong> ở cuối trang để lưu câu hỏi vào database.
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            {/* Image Upload */}
            <div className="relative group">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={!canUploadMedia || uploading.image}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                  canUploadMedia
                    ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                } disabled:opacity-50`}
                title={!canUploadMedia ? 'Vui lòng lưu bài thi trước khi upload' : ''}
              >
                <ImageIcon size={16} />
                {uploading.image ? 'Đang upload...' : 'Thêm hình ảnh'}
              </button>
            </div>

            {/* Audio Upload */}
            {(examType === 'LISTENING' || examType === 'FULL_TEST') && (
              <div className="relative group">
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={!canUploadMedia || uploading.audio}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                    canUploadMedia
                      ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  } disabled:opacity-50`}
                  title={!canUploadMedia ? 'Vui lòng lưu bài thi trước khi upload' : ''}
                >
                  <Headphones size={16} />
                  {uploading.audio ? 'Đang upload...' : 'Thêm âm thanh'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {question.imageUrl && (
          <div className="relative inline-block">
            <img
              src={question.imageUrl}
              alt="Question"
              className="max-w-xs h-auto rounded-lg border border-gray-300"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Audio Preview */}
        {question.audioUrl && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Headphones className="text-blue-600" size={20} />
            <audio src={question.audioUrl} controls className="flex-1" />
            <button
              onClick={removeAudio}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Các đáp án <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Chỉ cần nhập nội dung, hệ thống tự động thêm "A.", "B.", "C.", "D."
          </p>
          <div className="space-y-2">
            {['A', 'B', 'C', 'D'].map((letter, index) => {
              // Lấy nội dung không có prefix để hiển thị trong input
              const optionValue = options[index] || '';
              const displayValue = optionValue.replace(/^[A-D]\.\s*/, '');
              
              return (
                <div key={letter} className="flex items-center gap-2">
                  <span className="w-8 text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-2 rounded border border-blue-200">
                    {letter}.
                  </span>
                  <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder={`Nhập nội dung (ví dụ: "Going to the restaurant")`}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Preview format */}
          {options.some(opt => opt) && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-700 mb-2">✅ Format sẽ lưu vào database:</p>
              <div className="space-y-1">
                {options.filter(opt => opt).map((opt, idx) => (
                  <div key={idx} className="text-xs font-mono text-blue-900 bg-white px-2 py-1 rounded">
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Correct Answer */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đáp án đúng <span className="text-red-500">*</span>
            </label>
            <select
              value={question.correctAnswer || 'A'}
              onChange={(e) => handleFieldChange('correctAnswer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Điểm
            </label>
            <input
              type="number"
              value={question.points || 1}
              onChange={(e) => handleFieldChange('points', parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giải thích
          </label>
          <textarea
            value={question.explanation || ''}
            onChange={(e) => handleFieldChange('explanation', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Giải thích đáp án đúng"
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;



