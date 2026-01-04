import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus,
  BookOpen,
  Headphones,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import PartEditor from '../../components/ExamEditor/PartEditor';
import ImportQuestionsModal from '../../components/ExamEditor/ImportQuestionsModal';
import AdminExamService from '../../services/AdminExamService';

const EXAM_TYPES = ['READING', 'LISTENING', 'FULL_TEST'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const ExamEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [exam, setExam] = useState({
    id: null,
    title: '',
    description: '',
    level: 'Intermediate',
    examType: 'READING',
    durationTimes: 60,
    instructions: '',
    requirements: '',
    parts: []
  });
  const [loading, setLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedPartForImport, setSelectedPartForImport] = useState(null);
  const [activePartIndex, setActivePartIndex] = useState(0);

  useEffect(() => {
    if (isEditing) {
      fetchExamData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchExamData = async () => {
    setLoading(true);
    try {
      const examData = await AdminExamService.getExamDetail(id);
      setExam(examData);
      setActivePartIndex(0);
    } catch (error) {
      console.error('Error fetching exam:', error);
      alert('Không thể tải thông tin bài thi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async () => {
    // Validate
    if (!exam.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài thi');
      return;
    }
    if (!exam.examType) {
      alert('Vui lòng chọn loại bài thi');
      return;
    }
    if (!exam.level) {
      alert('Vui lòng chọn cấp độ bài thi');
      return;
    }
    if (!exam.durationTimes || exam.durationTimes <= 0) {
      alert('Vui lòng nhập thời gian làm bài hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const examData = {
        title: exam.title,
        description: exam.description || '',
        level: exam.level,
        examType: exam.examType,
        durationTimes: exam.durationTimes,
        instructions: exam.instructions || '',
        requirements: exam.requirements || ''
      };

      let examId;
      if (isEditing) {
        await AdminExamService.updateExam(id, examData);
        examId = id;
      } else {
        const result = await AdminExamService.createExam(examData);
        examId = result.id;
      }

      // Save parts if any
      if (exam.parts.length > 0) {
        for (const part of exam.parts) {
          await savePart(examId, part);
        }
      }

      alert(isEditing ? 'Cập nhật bài thi thành công!' : 'Tạo bài thi thành công!');
      
      // QUAN TRỌNG: Reload exam data để lấy ID thật cho parts và questions
      console.log('🔄 Reloading exam data to get real IDs...');
      const freshData = await AdminExamService.getExamDetail(examId);
      setExam(freshData);
      console.log('✅ Exam reloaded. Parts có ID thật, bạn có thể upload media cho questions!');
      
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Có lỗi xảy ra khi lưu bài thi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const savePart = async (examId, part) => {
    const partData = {
      title: part.title,
      description: part.description || '',
      instructions: part.instructions || '',
      timeLimit: part.timeLimit || 30
    };

    let partId;
    if (part.id && !String(part.id).startsWith('temp_')) {
      await AdminExamService.updatePart(part.id, partData);
      partId = part.id;
    } else {
      const newPart = await AdminExamService.addPart(examId, partData);
      partId = newPart.id;
    }

    // Save questions
    if (part.questions && part.questions.length > 0) {
      for (const question of part.questions) {
        await saveQuestion(partId, question);
      }
    }
  };

  const saveQuestion = async (partId, question) => {
    // Parse options để đảm bảo format đúng trước khi stringify
    let optionsArray = [];
    if (Array.isArray(question.options)) {
      optionsArray = question.options;
    } else if (typeof question.option === 'string') {
      try {
        optionsArray = JSON.parse(question.option);
      } catch {
        optionsArray = [];
      }
    }

    // Đảm bảo mỗi đáp án có format "A. ...", "B. ...", "C. ...", "D. ..."
    const letters = ['A', 'B', 'C', 'D'];
    const formattedOptions = optionsArray.map((opt, idx) => {
      if (!opt) return '';
      const letter = letters[idx];
      // Nếu chưa có prefix, thêm vào
      if (!opt.startsWith(`${letter}. `)) {
        const cleanText = opt.replace(/^[A-D]\.\s*/, '');
        return cleanText ? `${letter}. ${cleanText}` : '';
      }
      return opt;
    });

    const questionData = {
      questionText: question.questionText,
      questionType: question.questionType || 'MULTIPLE_CHOICE',
      option: JSON.stringify(formattedOptions), // Stringify 1 lần duy nhất với format chuẩn
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      points: question.points || 1,
      audioUrl: question.audioUrl || null,
      imageUrl: question.imageUrl || null
    };

    console.log('💾 Saving question with options:', {
      raw: question.options,
      formatted: formattedOptions,
      stringified: questionData.option
    });

    if (question.id && !String(question.id).startsWith('temp_')) {
      // Update existing question
      await AdminExamService.updateQuestion(question.id, questionData);
    } else {
      // Create new question và lấy ID thật từ backend
      const response = await AdminExamService.addQuestion(partId, questionData);
      // QUAN TRỌNG: Cập nhật ID thật vào question sau khi tạo thành công
      if (response && response.id) {
        question.id = response.id;
        console.log('✅ Question created with real ID:', response.id);
      }
    }
  };

  const handleAddPart = () => {
    const newPart = {
      id: `temp_${Date.now()}`,
      title: `Phần ${exam.parts.length + 1}`,
      description: '',
      instructions: '',
      timeLimit: 30,
      questions: []
    };
    const newParts = [...exam.parts, newPart];
    setExam({ ...exam, parts: newParts });
    setActivePartIndex(newParts.length - 1);
  };

  const handleUpdatePart = (partIndex, updatedPart) => {
    const newParts = [...exam.parts];
    newParts[partIndex] = updatedPart;
    setExam({ ...exam, parts: newParts });
  };

  const handleDeletePart = async (partIndex) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phần thi này?')) {
      return;
    }

    const part = exam.parts[partIndex];
    if (part.id && !String(part.id).startsWith('temp_')) {
      try {
        await AdminExamService.deletePart(part.id);
      } catch (error) {
        console.error('Error deleting part:', error);
        alert('Có lỗi xảy ra khi xóa phần thi');
        return;
      }
    }

    const newParts = exam.parts.filter((_, index) => index !== partIndex);
    setExam({ ...exam, parts: newParts });

    if (newParts.length === 0) {
      setActivePartIndex(0);
    } else {
      if (partIndex < activePartIndex) {
        setActivePartIndex((prev) => Math.max(0, prev - 1));
      } else if (partIndex === activePartIndex) {
        setActivePartIndex((prev) => Math.min(prev, newParts.length - 1));
      }
    }
  };

  const handleImportQuestions = async (questions) => {
    if (!selectedPartForImport) {
      alert('Vui lòng chọn phần thi để import câu hỏi');
      return;
    }

    const partIndex = exam.parts.findIndex(p => p.id === selectedPartForImport);
    if (partIndex === -1) {
      alert('Không tìm thấy phần thi');
      return;
    }

    // Nếu part đã được lưu, import trực tiếp vào database
    const part = exam.parts[partIndex];
    if (part.id && !String(part.id).startsWith('temp_')) {
      try {
        setLoading(true);
        
        // Import từng câu hỏi vào database
        for (const question of questions) {
          await AdminExamService.addQuestion(part.id, question);
        }

        // Reload exam data để cập nhật UI
        const freshData = await AdminExamService.getExamDetail(exam.id);
        setExam(freshData);
        
        alert(`✅ Đã import thành công ${questions.length} câu hỏi!`);
      } catch (error) {
        console.error('Error importing questions:', error);
        alert('Có lỗi khi import câu hỏi: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    } else {
      // Part chưa lưu, thêm vào state tạm
      const updatedPart = {
        ...part,
        questions: [...(part.questions || []), ...questions]
      };
      handleUpdatePart(partIndex, updatedPart);
      alert(`✅ Đã thêm ${questions.length} câu hỏi vào phần thi. Nhớ bấm "Lưu bài thi" để lưu vào database!`);
    }

    setImportModalOpen(false);
    setSelectedPartForImport(null);
  };

  const handleOpenImportModal = (partId) => {
    setSelectedPartForImport(partId);
    setImportModalOpen(true);
  };

  const getExamTypeIcon = (type) => {
    switch (type) {
      case 'READING':
        return <BookOpen className="w-5 h-5" />;
      case 'LISTENING':
        return <Headphones className="w-5 h-5" />;
      case 'FULL_TEST':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/tests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}
        </h1>
      </div>

      {/* Basic Info Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cơ bản</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề bài thi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={exam.title}
              onChange={(e) => setExam({ ...exam, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề bài thi"
            />
          </div>

          {/* Exam Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại bài thi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EXAM_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setExam({ ...exam, examType: type })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    exam.examType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {getExamTypeIcon(type)}
                  <span className="font-medium text-sm">
                    {type === 'READING' ? 'Reading' : type === 'LISTENING' ? 'Listening' : 'Full Test'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cấp độ <span className="text-red-500">*</span>
            </label>
            <select
              value={exam.level}
              onChange={(e) => setExam({ ...exam, level: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian (phút) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={exam.durationTimes}
              onChange={(e) => setExam({ ...exam, durationTimes: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={exam.description}
              onChange={(e) => setExam({ ...exam, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Mô tả về bài thi"
            />
          </div>

          {/* Instructions */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hướng dẫn
            </label>
            <textarea
              value={exam.instructions}
              onChange={(e) => setExam({ ...exam, instructions: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Hướng dẫn làm bài"
            />
          </div>

          {/* Requirements */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yêu cầu
            </label>
            <textarea
              value={exam.requirements}
              onChange={(e) => setExam({ ...exam, requirements: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Các yêu cầu cho thí sinh"
            />
          </div>
        </div>
      </div>

      {/* Parts Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Các phần thi</h2>
          <button
            onClick={handleAddPart}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Thêm phần thi
          </button>
        </div>

        {exam.parts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có phần thi nào. Nhấn "Thêm phần thi" để bắt đầu.</p>
          </div>
        ) : (
          <>
            {/* Thanh điều hướng giữa các phần */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                {exam.parts.map((part, index) => (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => setActivePartIndex(index)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      index === activePartIndex
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Phần {index + 1}
                  </button>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Đang xem: <span className="font-medium">Phần {activePartIndex + 1}</span> / {exam.parts.length}
              </div>
            </div>

            {/* Editor cho phần đang chọn */}
            <div className="space-y-4">
              {exam.parts[activePartIndex] && (
                <PartEditor
                  key={exam.parts[activePartIndex].id}
                  part={exam.parts[activePartIndex]}
                  partIndex={activePartIndex}
                  examType={exam.examType}
                  onUpdate={(updatedPart) => handleUpdatePart(activePartIndex, updatedPart)}
                  onDelete={() => handleDeletePart(activePartIndex)}
                  onOpenImportModal={handleOpenImportModal}
                />
              )}
            </div>

            {/* Nút chuyển part trước / sau */}
            {exam.parts.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setActivePartIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activePartIndex === 0}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Phần trước
                </button>
                <button
                  type="button"
                  onClick={() => setActivePartIndex((prev) => Math.min(exam.parts.length - 1, prev + 1))}
                  disabled={activePartIndex === exam.parts.length - 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Phần tiếp →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">Lưu ý quan trọng</h3>
            <p className="text-sm text-blue-800">
              Sau khi click <strong>"Lưu bài thi"</strong>, hệ thống sẽ lưu tất cả parts và questions vào database. 
              Sau đó bạn có thể upload hình ảnh và audio cho từng câu hỏi.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button
          onClick={() => navigate('/admin/tests')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          onClick={handleSaveExam}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          title="Lưu bài thi và tất cả parts/questions vào database"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật bài thi' : 'Lưu bài thi')}
        </button>
      </div>

      {/* Import Questions Modal */}
      <ImportQuestionsModal
        isOpen={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setSelectedPartForImport(null);
        }}
        onImport={handleImportQuestions}
        partId={selectedPartForImport}
      />
    </div>
  );
};

export default ExamEditor;
