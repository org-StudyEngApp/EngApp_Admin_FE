import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus
} from 'lucide-react';
import PartEditor from '../../components/ExamEditor/PartEditor';
import AdminExamService from '../../services/AdminExamService';

const ExamEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  console.log('ExamEditor mounted, id:', id, 'isEditing:', isEditing); // Debug log

  const [exam, setExam] = useState({
    id: null,
    title: '',
    description: '',
    level: 'TOPIK I',
    durationTimes: 60,
    instructions: '',
    requirements: '',
    parts: []
  });
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [expandedParts, setExpandedParts] = useState({});

  useEffect(() => {
    console.log('ExamEditor useEffect, isEditing:', isEditing, 'id:', id); // Debug log
    if (isEditing) {
      fetchExamData();
    }
  }, [id, isEditing]);

  const fetchExamData = async () => {
    setLoading(true);
    try {
      const examData = await AdminExamService.getExamDetail(id);
      setExam(examData);
    } catch (error) {
      console.error('Error fetching exam:', error);
      alert('Không thể tải thông tin bài thi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!exam.title.trim()) {
        alert('Vui lòng nhập tiêu đề bài thi');
        setLoading(false);
        return;
      }
      
      if (!exam.level) {
        alert('Vui lòng chọn cấp độ bài thi');
        setLoading(false);
        return;
      }
      
      if (!exam.durationTimes || exam.durationTimes <= 0) {
        alert('Vui lòng nhập thời gian làm bài hợp lệ');
        setLoading(false);
        return;
      }

      // Prepare data for API
      const examData = {
        title: exam.title,
        description: exam.description || '',
        level: exam.level,
        durationTimes: exam.durationTimes,
        instructions: exam.instructions || '',
        requirements: exam.requirements || ''
      };

      console.log('Saving exam data:', examData);
      
      // 1. Lưu thông tin cơ bản của bài thi
      let examId;
      let result;
      
      if (isEditing) {
        result = await AdminExamService.updateExam(id, examData);
        examId = id;
        console.log('Updated exam:', result);
      } else {
        result = await AdminExamService.createExam(examData);
        examId = result.id;
        console.log('Created new exam with ID:', examId);
      }

      // 2. Lưu các phần thi và câu hỏi nếu có
      if (exam.parts.length > 0) {
        for (const part of exam.parts) {
          const partData = {
            title: part.title,
            description: part.description || '',
            instructions: part.instructions || '',
            timeLimit: part.timeLimit || 30
          };

          console.log(`Saving part for exam ${examId}:`, partData);
          
          // Tạo phần thi mới hoặc cập nhật phần thi hiện có
          let partId;
          if (part.id && !isNaN(parseInt(part.id)) && part.id < 1000000) {
            // Part đã tồn tại trong database
            const updatedPart = await AdminExamService.updatePart(part.id, partData);
            partId = part.id;
            console.log('Updated existing part:', updatedPart);
          } else {
            // Part mới
            const newPart = await AdminExamService.addPart(examId, partData);
            partId = newPart.id;
            console.log('Added new part with ID:', partId);
          }

          // Lưu câu hỏi cho phần thi
          if (part.questions && part.questions.length > 0) {
            for (const question of part.questions) {
              const questionData = {
                questionText: question.questionText,
                questionType: question.questionType,
                option: question.option,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation || '',
                points: question.points || 1,
                questionOrder: question.questionOrder || 1,
                // Không bao gồm imageUrl và audioUrl ở đây, sẽ upload riêng
              };

              console.log(`Saving question for part ${partId}:`, questionData);
              
              // Tạo câu hỏi mới hoặc cập nhật câu hỏi hiện có
              let questionId;
              if (question.id && !isNaN(parseInt(question.id)) && question.id < 1000000) {
                // Question đã tồn tại
                const updatedQuestion = await AdminExamService.updateQuestion(question.id, questionData);
                questionId = question.id;
                console.log('Updated existing question:', updatedQuestion);
              } else {
                // Question mới
                const newQuestion = await AdminExamService.addQuestion(partId, questionData);
                questionId = newQuestion.id;
                console.log('Added new question with ID:', questionId);
              }

              // Upload media files nếu có và là blob URLs (chưa được upload)
              if (question.imageUrl && question.imageUrl.startsWith('blob:')) {
                try {
                  // File ảnh mới cần được upload
                  console.log(`Đang xử lý upload ảnh cho câu hỏi ${questionId}`);
                  const imageFile = await fetch(question.imageUrl).then(r => r.blob());
                  const formattedFile = new File([imageFile], `question_${questionId}_image.png`, { type: 'image/png' });
                  await AdminExamService.uploadFileAndUpdateQuestion(questionId, formattedFile, 'image');
                  console.log(`Upload ảnh thành công cho câu hỏi ${questionId}`);
                } catch (error) {
                  console.error(`Lỗi upload ảnh:`, error);
                }
              }

              if (question.audioUrl && question.audioUrl.startsWith('blob:')) {
                try {
                  // File audio mới cần được upload
                  console.log(`Đang xử lý upload audio cho câu hỏi ${questionId}`);
                  const audioFile = await fetch(question.audioUrl).then(r => r.blob());
                  const formattedFile = new File([audioFile], `question_${questionId}_audio.mp3`, { type: 'audio/mpeg' });
                  await AdminExamService.uploadFileAndUpdateQuestion(questionId, formattedFile, 'audio');
                  console.log(`Upload audio thành công cho câu hỏi ${questionId}`);
                } catch (error) {
                  console.error(`Lỗi upload audio:`, error);
                }
              }
            }
          }
        }
      }

      alert(isEditing ? 'Cập nhật bài thi thành công!' : 'Tạo bài thi thành công!');
      navigate('/admin/tests');
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Có lỗi xảy ra khi lưu bài thi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = () => {
    const newPart = {
      id: Date.now(),
      partNumber: exam.parts.length + 1,
      title: `Phần ${exam.parts.length + 1}`,
      description: '',
      instructions: '',
      timeLimit: 30,
      questionCount: 0,
      questions: []
    };
    setExam({
      ...exam,
      parts: [...exam.parts, newPart]
    });
  };

  const handleDeletePart = (partIndex) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phần này?')) {
      const updatedParts = exam.parts.filter((_, index) => index !== partIndex);
      setExam({
        ...exam,
        parts: updatedParts.map((part, index) => ({
          ...part,
          partNumber: index + 1
        }))
      });
    }
  };

  const handleAddQuestion = (partIndex) => {
    const newQuestion = {
      id: Date.now(),
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      option: 'A)  B)  C)  D) ',
      correctAnswer: 'A',
      explanation: '',
      audioUrl: null,
      imageUrl: null,
      questionOrder: exam.parts[partIndex].questions.length + 1,
      points: 1
    };

    const updatedParts = [...exam.parts];
    updatedParts[partIndex].questions.push(newQuestion);
    updatedParts[partIndex].questionCount = updatedParts[partIndex].questions.length;
    
    setExam({
      ...exam,
      parts: updatedParts
    });
  };

  const handleDeleteQuestion = (partIndex, questionIndex) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      const updatedParts = [...exam.parts];
      updatedParts[partIndex].questions.splice(questionIndex, 1);
      updatedParts[partIndex].questionCount = updatedParts[partIndex].questions.length;
      
      // Cập nhật lại order
      updatedParts[partIndex].questions.forEach((q, idx) => {
        q.questionOrder = idx + 1;
      });
      
      setExam({
        ...exam,
        parts: updatedParts
      });
    }
  };

  const handleFileUpload = async (file, type, partIndex, questionIndex) => {
    const uploadKey = `${partIndex}-${questionIndex}-${type}`;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    try {
      // Hiển thị preview ngay lập tức để UX tốt hơn
      const previewUrl = URL.createObjectURL(file);
      
      // Cập nhật state để hiển thị preview
      const updatedParts = [...exam.parts];
      if (type === 'image') {
        updatedParts[partIndex].questions[questionIndex].imageUrl = previewUrl;
      } else if (type === 'audio') {
        updatedParts[partIndex].questions[questionIndex].audioUrl = previewUrl;
      }
      
      setExam({ ...exam, parts: updatedParts });
      
      // Lấy question ID nếu câu hỏi đã được lưu trong database
      const question = updatedParts[partIndex].questions[questionIndex];
      if (question.id && !isNaN(parseInt(question.id)) && question.id < 1000000) {
        // Câu hỏi đã tồn tại trong DB, upload và cập nhật ngay
        try {
          const result = await AdminExamService.uploadFileAndUpdateQuestion(
            question.id, 
            file, 
            type
          );
          
          // Cập nhật URL thực từ Cloudinary
          if (type === 'image') {
            updatedParts[partIndex].questions[questionIndex].imageUrl = result.url;
          } else if (type === 'audio') {
            updatedParts[partIndex].questions[questionIndex].audioUrl = result.url;
          }
          
          setExam({ ...exam, parts: updatedParts });
          alert(`Upload ${type} thành công!`);
        } catch (error) {
          console.error(`Lỗi upload ${type} lên server:`, error);
          alert(`Upload ${type} lên server thất bại: ${error.message}`);
          
          // Xóa preview nếu upload thất bại
          if (type === 'image') {
            updatedParts[partIndex].questions[questionIndex].imageUrl = null;
          } else if (type === 'audio') {
            updatedParts[partIndex].questions[questionIndex].audioUrl = null;
          }
          setExam({ ...exam, parts: updatedParts });
        }
      } else {
        // Câu hỏi chưa có trong DB, lưu file tạm vào state để sau lưu bài thi sẽ upload
        console.log(`Câu hỏi chưa được lưu trong DB, sẽ upload ${type} khi lưu bài thi`);
      }
    } catch (error) {
      console.error(`Error handling ${type} file:`, error);
      alert(`Lỗi xử lý file ${type}: ${error.message}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const togglePartExpanded = (partIndex) => {
    setExpandedParts(prev => ({
      ...prev,
      [partIndex]: !prev[partIndex]
    }));
  };

  const updateExamField = (field, value) => {
    setExam({
      ...exam,
      [field]: value
    });
  };

  const updatePartField = (partIndex, field, value) => {
    const updatedParts = [...exam.parts];
    updatedParts[partIndex][field] = value;
    setExam({
      ...exam,
      parts: updatedParts
    });
  };

  const updateQuestionField = (partIndex, questionIndex, field, value) => {
    const updatedParts = [...exam.parts];
    updatedParts[partIndex].questions[questionIndex][field] = value;
    setExam({
      ...exam,
      parts: updatedParts
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/tests')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                Quay lại
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}
                </h1>
                <p className="text-gray-600">{exam.title || 'Nhập tiêu đề bài thi'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveExam}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {loading ? 'Đang lưu...' : 'Lưu bài thi'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài thi *
              </label>
              <input
                type="text"
                value={exam.title}
                onChange={(e) => updateExamField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tiêu đề bài thi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cấp độ *
              </label>
              <select
                value={exam.level}
                onChange={(e) => updateExamField('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TOPIK I">TOPIK I</option>
                <option value="TOPIK II">TOPIK II</option>
                <option value="Sơ cấp">Sơ cấp</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Cao cấp">Cao cấp</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={exam.description}
              onChange={(e) => updateExamField('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả về bài thi"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian (phút) *
              </label>
              <input
                type="number"
                value={exam.durationTimes}
                onChange={(e) => updateExamField('durationTimes', parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tổng số phần
              </label>
              <input
                type="text"
                value={exam.parts.length}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tổng câu hỏi
              </label>
              <input
                type="text"
                value={exam.parts.reduce((sum, part) => sum + part.questions.length, 0)}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hướng dẫn
              </label>
              <textarea
                value={exam.instructions}
                onChange={(e) => updateExamField('instructions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hướng dẫn làm bài"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yêu cầu
              </label>
              <textarea
                value={exam.requirements}
                onChange={(e) => updateExamField('requirements', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Yêu cầu đối với thí sinh"
              />
            </div>
          </div>
        </div>

        {/* Parts Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Cấu trúc bài thi</h2>
            <button
              onClick={handleAddPart}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Thêm phần
            </button>
          </div>

          {exam.parts.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Chưa có phần nào. Nhấn "Thêm phần" để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exam.parts.map((part, partIndex) => (
                <PartEditor
                  key={part.id}
                  part={part}
                  partIndex={partIndex}
                  isExpanded={expandedParts[partIndex]}
                  onToggleExpanded={() => togglePartExpanded(partIndex)}
                  onUpdatePart={(field, value) => updatePartField(partIndex, field, value)}
                  onDeletePart={() => handleDeletePart(partIndex)}
                  onAddQuestion={() => handleAddQuestion(partIndex)}
                  onUpdateQuestion={(questionIndex, field, value) => 
                    updateQuestionField(partIndex, questionIndex, field, value)
                  }
                  onDeleteQuestion={(questionIndex) => 
                    handleDeleteQuestion(partIndex, questionIndex)
                  }
                  onFileUpload={(file, type, questionIndex) => 
                    handleFileUpload(file, type, partIndex, questionIndex)
                  }
                  uploadingFiles={uploadingFiles}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamEditor;