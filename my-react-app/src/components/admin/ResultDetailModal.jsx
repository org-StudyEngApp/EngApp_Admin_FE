import React from 'react';

const ResultDetailModal = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Exam Result Detail</h2>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* User Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">User Information</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{result.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{result.userEmail}</p>
              </div>
            </div>
          </div>

          {/* Exam Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Exam Information</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Exam Title</p>
                <p className="font-semibold text-gray-900">{result.examTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Exam Type</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  result.examType === 'READING' ? 'bg-green-100 text-green-800' :
                  result.examType === 'LISTENING' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {result.examType === 'READING' ? '📖 Reading' : 
                   result.examType === 'LISTENING' ? '🎧 Listening' : 
                   '📄 Full Test'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Test Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(result.testDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Overall Performance</h3>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#4f46e5"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.accuracy / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-600">
                          {result.accuracy.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-gray-900 mb-2">{result.totalScore}</p>
                      <p className="text-gray-600">
                        {result.totalCorrect} / {result.totalQuestions} correct
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {result.totalIncorrect} incorrect
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown for Full Test */}
          {(result.readingBreakdown || result.listeningBreakdown) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Skills Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reading Breakdown */}
                {result.readingBreakdown && (
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">📖</span>
                      <h4 className="text-lg font-semibold text-green-800">Reading</h4>
                    </div>
                    <p className="text-3xl font-bold text-green-700 mb-2">
                      {result.readingBreakdown.score}
                    </p>
                    <p className="text-gray-700 mb-2">
                      {result.readingBreakdown.correct} / {result.readingBreakdown.total} correct
                    </p>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.readingBreakdown.accuracy}%` }}
                      />
                    </div>
                    <p className="text-sm text-green-600 mt-2 font-semibold">
                      {result.readingBreakdown.accuracy.toFixed(1)}% accuracy
                    </p>
                  </div>
                )}

                {/* Listening Breakdown */}
                {result.listeningBreakdown && (
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-600">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🎧</span>
                      <h4 className="text-lg font-semibold text-orange-800">Listening</h4>
                    </div>
                    <p className="text-3xl font-bold text-orange-700 mb-2">
                      {result.listeningBreakdown.score}
                    </p>
                    <p className="text-gray-700 mb-2">
                      {result.listeningBreakdown.correct} / {result.listeningBreakdown.total} correct
                    </p>
                    <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.listeningBreakdown.accuracy}%` }}
                      />
                    </div>
                    <p className="text-sm text-orange-600 mt-2 font-semibold">
                      {result.listeningBreakdown.accuracy.toFixed(1)}% accuracy
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailModal;
