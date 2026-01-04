import React, { useEffect, useState } from 'react';
import AdminExamService from '../../services/AdminExamService';
import ResultDetailModal from './ResultDetailModal';

const UserResultsView = ({ userId, userName }) => {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminExamService.getUserExamResults(
        userId,
        filter === 'ALL' ? null : filter
      );
      setResults(response.data || response || []);
    } catch (err) {
      console.error('Failed to load results:', err);
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filter]);

  const getExamTypeBadge = (type) => {
    const badges = {
      READING: '📖 Reading',
      LISTENING: '🎧 Listening',
      FULL_TEST: '📄 Full Test',
    };
    const colors = {
      READING: 'bg-green-100 text-green-800',
      LISTENING: 'bg-orange-100 text-orange-800',
      FULL_TEST: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors[type]}`}>
        {badges[type]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error loading results</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={loadResults}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Exam Results - {userName}
        </h2>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter('ALL')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'READING'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter('READING')}
          >
            📖 Reading
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'LISTENING'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter('LISTENING')}
          >
            🎧 Listening
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'FULL_TEST'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter('FULL_TEST')}
          >
            📄 Full Test
          </button>
        </div>
      </div>

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No exam results found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                <th className="p-3 text-left font-semibold text-gray-700">Exam</th>
                <th className="p-3 text-left font-semibold text-gray-700">Type</th>
                <th className="p-3 text-left font-semibold text-gray-700">Score</th>
                <th className="p-3 text-left font-semibold text-gray-700">Correct</th>
                <th className="p-3 text-left font-semibold text-gray-700">Accuracy</th>
                <th className="p-3 text-left font-semibold text-gray-700">Breakdown</th>
                <th className="p-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.resultId} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {new Date(result.testDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-3 font-medium">{result.examTitle}</td>
                  <td className="p-3">{getExamTypeBadge(result.examType)}</td>
                  <td className="p-3">
                    <span className="text-lg font-bold text-indigo-600">
                      {result.totalScore}
                    </span>
                  </td>
                  <td className="p-3">
                    {result.totalCorrect} / {result.totalQuestions}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${result.accuracy}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{result.accuracy.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {result.readingBreakdown || result.listeningBreakdown ? (
                      <div className="flex flex-col text-sm">
                        {result.readingBreakdown && (
                          <span className="text-green-700">
                            📖 {result.readingBreakdown.score} ({result.readingBreakdown.correct}/
                            {result.readingBreakdown.total})
                          </span>
                        )}
                        {result.listeningBreakdown && (
                          <span className="text-orange-700">
                            🎧 {result.listeningBreakdown.score} ({result.listeningBreakdown.correct}/
                            {result.listeningBreakdown.total})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedResult && (
        <ResultDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

export default UserResultsView;
