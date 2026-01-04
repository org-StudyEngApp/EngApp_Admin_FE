import React, { useState, useEffect } from 'react';
import AdminExamService from '../../services/AdminExamService';
import ResultDetailModal from '../../components/admin/ResultDetailModal';
import { exportToCSV } from '../../utils/exportUtils';

const ExamResultsSearch = () => {
  const [results, setResults] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [filters, setFilters] = useState({
    userName: '',
    examType: '',
    minScore: '',
    maxScore: '',
    startDate: '',
    endDate: '',
    page: 0,
    size: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clean up filters
      const cleanFilters = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          cleanFilters[key] = filters[key];
        }
      });

      const response = await AdminExamService.searchExamResults(cleanFilters);
      setResults(response.data || response);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchResults();
  };

  const handleReset = () => {
    setFilters({
      userName: '',
      examType: '',
      minScore: '',
      maxScore: '',
      startDate: '',
      endDate: '',
      page: 0,
      size: 20,
    });
  };

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Exam Results</h2>

        {/* Search Filters */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Name
              </label>
              <input
                type="text"
                placeholder="Search by user name..."
                value={filters.userName}
                onChange={(e) => handleFilterChange('userName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Type
              </label>
              <select
                value={filters.examType}
                onChange={(e) => handleFilterChange('examType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="READING">📖 Reading</option>
                <option value="LISTENING">🎧 Listening</option>
                <option value="FULL_TEST">📄 Full Test</option>
              </select>
            </div>

            {/* Min Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Score
              </label>
              <input
                type="number"
                placeholder="Min Score"
                value={filters.minScore}
                onChange={(e) => handleFilterChange('minScore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            {/* Max Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Score
              </label>
              <input
                type="number"
                placeholder="Max Score"
                value={filters.maxScore}
                onChange={(e) => handleFilterChange('maxScore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Search Results ({results.totalElements || 0} found)
            </h3>
            {results.content && results.content.length > 0 && (
              <button
                onClick={() => exportToCSV(results.content, 'exam_results_search')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                📥 Export to CSV
              </button>
            )}
          </div>

          {results.content && results.content.length > 0 ? (
            <>
              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="p-3 text-left font-semibold text-gray-700">User</th>
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
                    {results.content.map((result) => (
                      <tr key={result.resultId} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          {new Date(result.testDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-gray-900">{result.userName}</p>
                            <p className="text-xs text-gray-500">{result.userEmail}</p>
                          </div>
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
                            <span className="text-sm font-medium">
                              {result.accuracy.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {result.readingBreakdown || result.listeningBreakdown ? (
                            <div className="flex flex-col text-sm">
                              {result.readingBreakdown && (
                                <span className="text-green-700">
                                  📖 {result.readingBreakdown.score} (
                                  {result.readingBreakdown.correct}/{result.readingBreakdown.total})
                                </span>
                              )}
                              {result.listeningBreakdown && (
                                <span className="text-orange-700">
                                  🎧 {result.listeningBreakdown.score} (
                                  {result.listeningBreakdown.correct}/
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
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {results.number * results.size + 1} to{' '}
                  {Math.min((results.number + 1) * results.size, results.totalElements)} of{' '}
                  {results.totalElements} results
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={results.number === 0}
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {results.number + 1} of {results.totalPages}
                  </span>
                  <button
                    disabled={results.number >= results.totalPages - 1}
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No results found</p>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedResult && (
        <ResultDetailModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      )}
    </div>
  );
};

export default ExamResultsSearch;
