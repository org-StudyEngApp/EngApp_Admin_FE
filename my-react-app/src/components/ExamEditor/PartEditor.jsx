import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import QuestionEditor from './QuestionEditor';

const PartEditor = ({
  part,
  partIndex,
  examType,
  onUpdate,
  onDelete,
  onOpenImportModal
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handlePartFieldChange = (field, value) => {
    onUpdate({ ...part, [field]: value });
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `temp_${Date.now()}`,
      questionText: '',
      questionType: examType === 'LISTENING' ? 'LISTENING' : 'MULTIPLE_CHOICE',
      option: '[]',
      options: ['', '', '', ''], // For easier editing
      correctAnswer: 'A',
      explanation: '',
      points: 1,
      audioUrl: null,
      imageUrl: null
    };
    onUpdate({ ...part, questions: [...(part.questions || []), newQuestion] });
  };

  const handleUpdateQuestion = (questionIndex, updatedQuestion) => {
    const newQuestions = [...(part.questions || [])];
    newQuestions[questionIndex] = updatedQuestion;
    onUpdate({ ...part, questions: newQuestions });
  };

  const handleDeleteQuestion = async (questionIndex) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      return;
    }

    // If question exists in DB, we should delete it via API
    // For now, just remove from local state
    const newQuestions = part.questions.filter((_, index) => index !== questionIndex);
    onUpdate({ ...part, questions: newQuestions });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Part Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Phần {partIndex + 1}
            </span>
            <input
              type="text"
              value={part.title}
              onChange={(e) => handlePartFieldChange('title', e.target.value)}
              className="text-lg font-medium bg-transparent border-none focus:outline-none flex-1"
              placeholder="Tiêu đề phần thi"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {part.questions?.length || 0} câu
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
              title="Xóa phần"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={part.description || ''}
                onChange={(e) => handlePartFieldChange('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Mô tả phần thi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hướng dẫn
              </label>
              <textarea
                value={part.instructions || ''}
                onChange={(e) => handlePartFieldChange('instructions', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Hướng dẫn làm bài"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian (phút)
              </label>
              <input
                type="number"
                value={part.timeLimit || 30}
                onChange={(e) => handlePartFieldChange('timeLimit', parseInt(e.target.value) || 0)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Questions Section */}
      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Câu hỏi</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenImportModal && onOpenImportModal(part.id)}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                title="Import câu hỏi từ Excel"
              >
                <FileSpreadsheet size={16} />
                Import Excel
              </button>
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Thêm câu hỏi
              </button>
            </div>
          </div>

          {!part.questions || part.questions.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 text-sm">Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {part.questions.map((question, questionIndex) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  questionIndex={questionIndex}
                  examType={examType}
                  onUpdate={(updatedQuestion) => handleUpdateQuestion(questionIndex, updatedQuestion)}
                  onDelete={() => handleDeleteQuestion(questionIndex)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartEditor;
