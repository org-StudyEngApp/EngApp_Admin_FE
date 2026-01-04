import React, { useState } from 'react';
import { Upload, Download, X, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const ImportQuestionsModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [workbookData, setWorkbookData] = useState(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    // Tạo template Excel
    const template = [
      {
        'Question Text': 'The company _____ a new product line next month.',
        'Question Type': 'MULTIPLE_CHOICE',
        'Option A': 'launch',
        'Option B': 'launches',
        'Option C': 'will launch',
        'Option D': 'launched',
        'Correct Answer': 'C',
        'Explanation': 'Dùng "will launch" vì có trạng từ chỉ tương lai "next month"',
        'Points': '1'
      },
      {
        'Question Text': 'What does the man suggest?',
        'Question Type': 'LISTENING',
        'Option A': 'Going to the restaurant',
        'Option B': 'Ordering takeout',
        'Option C': 'Cooking at home',
        'Option D': 'Skipping dinner',
        'Correct Answer': 'B',
        'Explanation': 'Người đàn ông gợi ý đặt đồ ăn mang về',
        'Points': '1'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 50 }, // Question Text
      { wch: 20 }, // Question Type
      { wch: 30 }, // Option A
      { wch: 30 }, // Option B
      { wch: 30 }, // Option C
      { wch: 30 }, // Option D
      { wch: 15 }, // Correct Answer
      { wch: 50 }, // Explanation
      { wch: 10 }  // Points
    ];

    XLSX.writeFile(wb, 'exam_questions_template.xlsx');
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      alert('Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file) => {
    setIsProcessing(true);
    setErrors([]);
    setPreview([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Lưu workbook để dùng sau
        setWorkbookData(workbook);
        
        // Lấy danh sách sheets
        const sheets = workbook.SheetNames;
        setAvailableSheets(sheets);
        
        // Tự động chọn sheet đầu tiên
        const firstSheet = sheets[0];
        setSelectedSheet(firstSheet);
        
        // Parse sheet đầu tiên
        parseSheet(workbook, firstSheet);
      } catch (error) {
        console.error('Parse error:', error);
        setErrors(['Lỗi khi đọc file: ' + error.message]);
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const parseSheet = (workbook, sheetName) => {
    try {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        setErrors([`Sheet "${sheetName}" không có dữ liệu`]);
        setPreview([]);
        setIsProcessing(false);
        return;
      }

      // Parse và validate
      const { questions, errors: parseErrors } = parseQuestions(jsonData);
      setPreview(questions);
      setErrors(parseErrors);
      setIsProcessing(false);
    } catch (error) {
      console.error('Parse sheet error:', error);
      setErrors(['Lỗi khi đọc sheet: ' + error.message]);
      setPreview([]);
      setIsProcessing(false);
    }
  };

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    setIsProcessing(true);
    setErrors([]);
    setPreview([]);
    
    if (workbookData) {
      parseSheet(workbookData, sheetName);
    }
  };

  const parseQuestions = (data) => {
    const questions = [];
    const errors = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 vì row 1 là header và Excel bắt đầu từ 1

      try {
        // Required fields
        if (!row['Question Text']) {
          errors.push(`Dòng ${rowNumber}: Thiếu Question Text`);
          return;
        }

        if (!row['Correct Answer']) {
          errors.push(`Dòng ${rowNumber}: Thiếu Correct Answer`);
          return;
        }

        // Parse options
        const optionA = (row['Option A'] || '').toString().trim();
        const optionB = (row['Option B'] || '').toString().trim();
        const optionC = (row['Option C'] || '').toString().trim();
        const optionD = (row['Option D'] || '').toString().trim();

        if (!optionA || !optionB || !optionC || !optionD) {
          errors.push(`Dòng ${rowNumber}: Thiếu options (phải có đủ A, B, C, D)`);
          return;
        }

        // Format options với prefix
        const options = [
          `A. ${optionA}`,
          `B. ${optionB}`,
          `C. ${optionC}`,
          `D. ${optionD}`
        ];

        // Validate correct answer
        const correctAnswer = (row['Correct Answer'] || '').toString().toUpperCase().trim();
        if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
          errors.push(`Dòng ${rowNumber}: Correct Answer phải là A, B, C, hoặc D`);
          return;
        }

        const question = {
          questionText: row['Question Text'].toString().trim(),
          questionType: (row['Question Type'] || 'MULTIPLE_CHOICE').toString().trim().toUpperCase(),
          option: JSON.stringify(options), // Convert to JSON string
          correctAnswer: correctAnswer,
          explanation: (row['Explanation'] || '').toString().trim(),
          points: parseInt(row['Points'] || 1),
          imageUrl: (row['Image URL'] || '').toString().trim() || null,
          audioUrl: (row['Audio URL'] || '').toString().trim() || null
        };

        questions.push(question);
      } catch (error) {
        errors.push(`Dòng ${rowNumber}: ${error.message}`);
      }
    });

    return { questions, errors };
  };

  const handleImport = () => {
    if (preview.length === 0) {
      alert('Không có câu hỏi nào để import');
      return;
    }

    if (errors.length > 0) {
      const confirm = window.confirm(
        `Có ${errors.length} lỗi trong file. Bạn có muốn import ${preview.length} câu hỏi hợp lệ không?`
      );
      if (!confirm) return;
    }

    onImport(preview);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setAvailableSheets([]);
    setSelectedSheet('');
    setWorkbookData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Import Câu Hỏi từ Excel</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Hướng dẫn:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Tải file Excel mẫu bên dưới</li>
              <li>Điền thông tin câu hỏi vào file (mỗi dòng = 1 câu hỏi)</li>
              <li>Upload file đã điền và xem preview</li>
              <li>Nhấn "Import" để thêm vào bài thi</li>
              <li>⚠️ Hình ảnh và audio sẽ upload riêng sau khi câu hỏi đã lưu</li>
            </ol>
            <div className="mt-3">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Tải File Mẫu (Template)
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file Excel/CSV
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {file.name}
                </span>
              )}
            </div>
          </div>

          {/* Sheet Selection */}
          {availableSheets.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Sheet
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableSheets.map((sheetName) => (
                    <option key={sheetName} value={sheetName}>
                      {sheetName}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">
                  {availableSheets.length} sheet{availableSheets.length > 1 ? 's' : ''}
                </span>
              </div>
              {availableSheets.length > 1 && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 File có nhiều sheets - Chọn sheet phù hợp với part đang import
                </p>
              )}
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang xử lý file...</p>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">
                  Phát hiện {errors.length} lỗi:
                </h3>
              </div>
              <ul className="text-sm text-red-800 space-y-1 list-disc list-inside max-h-40 overflow-y-auto">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  ✅ Preview: {preview.length} câu hỏi hợp lệ
                </h3>
              </div>
              
              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {preview.slice(0, 5).map((question, index) => (
                  <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="font-semibold text-gray-900">Câu {index + 1}:</span>
                      <span className="text-gray-700">{question.questionText}</span>
                    </div>
                    <div className="ml-6 text-sm space-y-1">
                      {JSON.parse(question.option).map((opt, i) => (
                        <div
                          key={i}
                          className={`${
                            question.correctAnswer === ['A', 'B', 'C', 'D'][i]
                              ? 'text-green-700 font-medium'
                              : 'text-gray-600'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="ml-6 mt-2 text-sm text-blue-600">
                        💡 {question.explanation}
                      </div>
                    )}
                  </div>
                ))}
                {preview.length > 5 && (
                  <div className="p-3 text-center text-sm text-gray-500">
                    ... và {preview.length - 5} câu hỏi khác
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {preview.length > 0 && (
              <span>
                Sẵn sàng import <strong>{preview.length}</strong> câu hỏi
                {errors.length > 0 && (
                  <span className="text-red-600 ml-2">
                    ({errors.length} lỗi)
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleImport}
              disabled={preview.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Import {preview.length > 0 && `(${preview.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportQuestionsModal;
