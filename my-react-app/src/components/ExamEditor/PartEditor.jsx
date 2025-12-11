import React from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  Plus,
  GripVertical
} from 'lucide-react';
import QuestionEditor from './QuestionEditor';

const PartEditor = ({
  part,
  partIndex,
  isExpanded,
  onToggleExpanded,
  onUpdatePart,
  onDeletePart,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onFileUpload,
  uploadingFiles
}) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Part Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="text-gray-400 cursor-move" size={16} />
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                Phần {part.partNumber}
              </span>
              <input
                type="text"
                value={part.title}
                onChange={(e) => onUpdatePart('title', e.target.value)}
                className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 min-w-0 flex-1"
                placeholder="Tiêu đề phần thi"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {part.questions.length} câu hỏi
            </span>
            <button
              onClick={onToggleExpanded}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <button
              onClick={onDeletePart}
              className="p-1 hover:bg-red-100 rounded text-red-600"
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
                value={part.description}
                onChange={(e) => onUpdatePart('description', e.target.value)}
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
                value={part.instructions}
                onChange={(e) => onUpdatePart('instructions', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Hướng dẫn cho phần này"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian (phút)
              </label>
              <input
                type="number"
                value={part.timeLimit}
                onChange={(e) => onUpdatePart('timeLimit', parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Questions Section */}
      {isExpanded && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Câu hỏi</h4>
            <button
              onClick={onAddQuestion}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus size={14} />
              Thêm câu hỏi
            </button>
          </div>

          {part.questions.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 text-sm">Chưa có câu hỏi nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {part.questions.map((question, questionIndex) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  questionIndex={questionIndex}
                  partIndex={partIndex}
                  onUpdateQuestion={onUpdateQuestion}
                  onDeleteQuestion={onDeleteQuestion}
                  onFileUpload={onFileUpload}
                  uploadingFiles={uploadingFiles}
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
