/**
 * Export utilities for exam results data
 */

/**
 * Export exam results to CSV format
 * @param {Array} results - Array of exam result objects
 * @param {string} filename - Name of the file to download (without extension)
 */
export const exportToCSV = (results, filename = 'exam_results') => {
  if (!results || results.length === 0) {
    console.warn('No results to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Result ID',
    'User Name',
    'User Email',
    'Exam Title',
    'Exam Type',
    'Test Date',
    'Overall Score',
    'Overall Correct',
    'Overall Total',
    'Overall Incorrect',
    'Accuracy (%)',
    'Reading Score',
    'Reading Correct',
    'Reading Total',
    'Reading Accuracy (%)',
    'Listening Score',
    'Listening Correct',
    'Listening Total',
    'Listening Accuracy (%)',
  ];

  // Convert results to CSV rows
  const csvContent = [
    headers.join(','),
    ...results.map((r) =>
      [
        r.resultId,
        `"${r.userName}"`, // Quote to handle commas in names
        r.userEmail,
        `"${r.examTitle}"`, // Quote to handle commas in titles
        r.examType,
        new Date(r.testDate).toISOString(),
        r.totalScore,
        r.totalCorrect,
        r.totalQuestions,
        r.totalIncorrect,
        r.accuracy.toFixed(2),
        r.readingBreakdown?.score || '',
        r.readingBreakdown?.correct || '',
        r.readingBreakdown?.total || '',
        r.readingBreakdown?.accuracy?.toFixed(2) || '',
        r.listeningBreakdown?.score || '',
        r.listeningBreakdown?.correct || '',
        r.listeningBreakdown?.total || '',
        r.listeningBreakdown?.accuracy?.toFixed(2) || '',
      ].join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Export statistics overview to CSV
 * @param {Object} overview - Statistics overview object
 * @param {string} filename - Name of the file to download (without extension)
 */
export const exportOverviewToCSV = (overview, filename = 'statistics_overview') => {
  if (!overview) {
    console.warn('No overview data to export');
    return;
  }

  const csvContent = [
    'Metric,Value',
    `Total Users,${overview.totalUsers}`,
    `Total Exams Taken,${overview.totalExamsTaken}`,
    `Reading Exams,${overview.examsByType?.READING || 0}`,
    `Listening Exams,${overview.examsByType?.LISTENING || 0}`,
    `Full Test Exams,${overview.examsByType?.FULL_TEST || 0}`,
    `Average Reading Score,${overview.averageScores?.reading?.toFixed(2) || 0}`,
    `Average Listening Score,${overview.averageScores?.listening?.toFixed(2) || 0}`,
    `Average Full Test Score,${overview.averageScores?.fullTest?.toFixed(2) || 0}`,
    `Overall Average Score,${overview.averageScores?.overall?.toFixed(2) || 0}`,
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export top performers to CSV
 * @param {Array} performers - Array of top performer objects
 * @param {string} filename - Name of the file to download (without extension)
 */
export const exportTopPerformersToCSV = (performers, filename = 'top_performers') => {
  if (!performers || performers.length === 0) {
    console.warn('No performers data to export');
    return;
  }

  const headers = ['Rank', 'User ID', 'User Name', 'Average Score (%)', 'Total Exams'];

  const csvContent = [
    headers.join(','),
    ...performers.map((p, index) =>
      [
        index + 1,
        p.userId,
        `"${p.userName}"`,
        p.averageScore.toFixed(2),
        p.totalExams,
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Format date for CSV export
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForExport = (date) => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Download data as JSON file
 * @param {Object|Array} data - Data to export
 * @param {string} filename - Name of the file to download (without extension)
 */
export const exportToJSON = (data, filename = 'exam_data') => {
  if (!data) {
    console.warn('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export default {
  exportToCSV,
  exportOverviewToCSV,
  exportTopPerformersToCSV,
  exportToJSON,
  formatDateForExport,
};
