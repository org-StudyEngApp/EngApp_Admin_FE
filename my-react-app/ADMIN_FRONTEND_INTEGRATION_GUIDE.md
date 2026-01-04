# 📘 Admin Frontend Integration Guide - Exam Results & Analytics Dashboard

## 📋 Table of Contents

1. [Overview](#overview)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [API Service Layer](#api-service-layer)
4. [Dashboard Components](#dashboard-components)
5. [User Results Management](#user-results-management)
6. [Search & Filter Interface](#search-filter-interface)
7. [Charts & Visualizations](#charts-visualizations)
8. [Export Functionality](#export-functionality)
9. [Complete Examples](#complete-examples)
10. [Deployment Guide](#deployment-guide)

---

## 🎯 Overview

Admin dashboard cho phép quản trị viên:

- ✅ Xem tổng quan thống kê (users, exams, scores)
- ✅ Theo dõi kết quả thi của từng user với **breakdown Reading/Listening**
- ✅ Phân tích xu hướng qua charts (Bar, Line, Pie, Doughnut)
- ✅ Tìm kiếm & filter kết quả thi
- ✅ Export dữ liệu

**Key Feature:** Full Test scores được **tách thành Reading + Listening** để admin thấy chi tiết kỹ năng từng phần.

---

## 📦 TypeScript Interfaces

Create `types/admin-exam-results.ts`:

```typescript
// types/admin-exam-results.ts

/**
 * Score breakdown for Reading/Listening in Full Test
 */
export interface ScoreBreakdown {
  score: number;
  correct: number;
  total: number;
  accuracy: number;
}

/**
 * Admin exam result detail with breakdown
 */
export interface AdminExamResultDetail {
  resultId: number;
  userId: number;
  userName: string;
  userEmail: string;
  examId: number;
  examTitle: string;
  examType: "READING" | "LISTENING" | "FULL_TEST";
  testDate: string; // ISO date string
  totalScore: number;
  totalCorrect: number;
  totalQuestions: number;
  totalIncorrect: number;
  accuracy: number;
  readingBreakdown?: ScoreBreakdown | null;
  listeningBreakdown?: ScoreBreakdown | null;
}

/**
 * Admin statistics overview
 */
export interface AdminStatisticsOverview {
  totalUsers: number;
  totalExamsTaken: number;
  examsByType: {
    READING: number;
    LISTENING: number;
    FULL_TEST: number;
  };
  averageScores: {
    reading: number;
    listening: number;
    fullTest: number;
    overall: number;
  };
  topPerformers: Array<{
    userId: number;
    userName: string;
    averageScore: number;
    totalExams: number;
  }>;
  recentActivity: Array<{
    resultId: number;
    userName: string;
    examTitle: string;
    score: number;
    testDate: string;
  }>;
}

/**
 * Dashboard analytics for charts
 */
export interface AdminDashboardAnalytics {
  period: "week" | "month" | "year";
  examTrends: {
    labels: string[];
    readingExams: number[];
    listeningExams: number[];
    fullTestExams: number[];
  };
  averageScoreTrends: {
    labels: string[];
    readingScores: number[];
    listeningScores: number[];
    fullTestScores: number[];
  };
  userEngagement: {
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
  };
}

/**
 * Search filters
 */
export interface ExamResultSearchFilters {
  userName?: string;
  examType?: "READING" | "LISTENING" | "FULL_TEST";
  minScore?: number;
  maxScore?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

/**
 * Paginated response
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

---

## 🔧 API Service Layer

Create `services/admin-exam.service.ts`:

```typescript
// services/admin-exam.service.ts

import axios, { AxiosInstance } from "axios";
import {
  AdminExamResultDetail,
  AdminStatisticsOverview,
  AdminDashboardAnalytics,
  ExamResultSearchFilters,
  PageResponse,
} from "@/types/admin-exam-results";

class AdminExamService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // JWT token interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Error interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          window.location.href = "/admin/login";
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get exam results for a specific user
   */
  async getUserExamResults(
    userId: number,
    examType?: "READING" | "LISTENING" | "FULL_TEST"
  ): Promise<AdminExamResultDetail[]> {
    const response = await this.api.get<AdminExamResultDetail[]>(
      `/api/v1/admin/exams/results/user/${userId}`,
      {
        params: { examType },
      }
    );
    return response.data;
  }

  /**
   * Get statistics overview for dashboard
   */
  async getStatisticsOverview(): Promise<AdminStatisticsOverview> {
    const response = await this.api.get<AdminStatisticsOverview>(
      "/api/v1/admin/exams/statistics/overview"
    );
    return response.data;
  }

  /**
   * Get dashboard analytics for charts
   */
  async getDashboardAnalytics(
    period: "week" | "month" | "year" = "month"
  ): Promise<AdminDashboardAnalytics> {
    const response = await this.api.get<AdminDashboardAnalytics>(
      "/api/v1/admin/exams/analytics/dashboard",
      {
        params: { period },
      }
    );
    return response.data;
  }

  /**
   * Search exam results with filters
   */
  async searchExamResults(
    filters: ExamResultSearchFilters
  ): Promise<PageResponse<AdminExamResultDetail>> {
    const response = await this.api.get<PageResponse<AdminExamResultDetail>>(
      "/api/v1/admin/exams/results/search",
      {
        params: {
          ...filters,
          page: filters.page || 0,
          size: filters.size || 20,
        },
      }
    );
    return response.data;
  }
}

export const adminExamService = new AdminExamService();
```

---

## 🧩 Dashboard Components

### Main Admin Dashboard

```typescript
// components/admin/AdminDashboard.tsx

import React, { useEffect, useState } from "react";
import { adminExamService } from "@/services/admin-exam.service";
import {
  AdminStatisticsOverview,
  AdminDashboardAnalytics,
} from "@/types/admin-exam-results";
import { StatisticsCards } from "./StatisticsCards";
import { TrendsCharts } from "./TrendsCharts";
import { TopPerformersTable } from "./TopPerformersTable";
import { RecentActivityList } from "./RecentActivityList";
import { Loader } from "@/components/Loader";
import { ErrorAlert } from "@/components/ErrorAlert";

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<AdminStatisticsOverview | null>(
    null
  );
  const [analytics, setAnalytics] = useState<AdminDashboardAnalytics | null>(
    null
  );
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewData, analyticsData] = await Promise.all([
        adminExamService.getStatisticsOverview(),
        adminExamService.getDashboardAnalytics(period),
      ]);
      setOverview(overviewData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading dashboard..." />;
  if (error)
    return (
      <ErrorAlert error={{ message: error }} onRetry={loadDashboardData} />
    );
  if (!overview || !analytics) return <div>No data available</div>;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="period-selector">
          <button
            className={period === "week" ? "active" : ""}
            onClick={() => setPeriod("week")}
          >
            Week
          </button>
          <button
            className={period === "month" ? "active" : ""}
            onClick={() => setPeriod("month")}
          >
            Month
          </button>
          <button
            className={period === "year" ? "active" : ""}
            onClick={() => setPeriod("year")}
          >
            Year
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards overview={overview} />

      {/* Charts */}
      <TrendsCharts analytics={analytics} />

      {/* Tables */}
      <div className="dashboard-grid">
        <TopPerformersTable performers={overview.topPerformers} />
        <RecentActivityList activities={overview.recentActivity} />
      </div>
    </div>
  );
};
```

### Statistics Cards Component

```typescript
// components/admin/StatisticsCards.tsx

import React from "react";
import { AdminStatisticsOverview } from "@/types/admin-exam-results";

interface Props {
  overview: AdminStatisticsOverview;
}

export const StatisticsCards: React.FC<Props> = ({ overview }) => {
  return (
    <div className="statistics-cards">
      <div className="stat-card blue">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <h3>Total Users</h3>
          <p className="stat-value">{overview.totalUsers}</p>
        </div>
      </div>

      <div className="stat-card green">
        <div className="stat-icon">📝</div>
        <div className="stat-content">
          <h3>Total Exams</h3>
          <p className="stat-value">{overview.totalExamsTaken}</p>
          <div className="stat-breakdown">
            <span>📖 Reading: {overview.examsByType.READING}</span>
            <span>🎧 Listening: {overview.examsByType.LISTENING}</span>
            <span>📄 Full: {overview.examsByType.FULL_TEST}</span>
          </div>
        </div>
      </div>

      <div className="stat-card orange">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3>Average Scores</h3>
          <p className="stat-value">
            {overview.averageScores.overall.toFixed(1)}%
          </p>
          <div className="stat-breakdown">
            <span>
              📖 Reading: {overview.averageScores.reading.toFixed(1)}%
            </span>
            <span>
              🎧 Listening: {overview.averageScores.listening.toFixed(1)}%
            </span>
            <span>📄 Full: {overview.averageScores.fullTest.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 👥 User Results Management

### User Results View Component

```typescript
// components/admin/UserResultsView.tsx

import React, { useEffect, useState } from "react";
import { adminExamService } from "@/services/admin-exam.service";
import { AdminExamResultDetail } from "@/types/admin-exam-results";
import { ResultDetailModal } from "./ResultDetailModal";

interface Props {
  userId: number;
  userName: string;
}

export const UserResultsView: React.FC<Props> = ({ userId, userName }) => {
  const [results, setResults] = useState<AdminExamResultDetail[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<AdminExamResultDetail | null>(null);
  const [filter, setFilter] = useState<
    "ALL" | "READING" | "LISTENING" | "FULL_TEST"
  >("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [userId, filter]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await adminExamService.getUserExamResults(
        userId,
        filter === "ALL" ? undefined : filter
      );
      setResults(data);
    } catch (error) {
      console.error("Failed to load results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-results-view">
      {/* Header */}
      <div className="results-header">
        <h2>Exam Results - {userName}</h2>
        <div className="filter-buttons">
          <button
            className={filter === "ALL" ? "active" : ""}
            onClick={() => setFilter("ALL")}
          >
            All
          </button>
          <button
            className={filter === "READING" ? "active" : ""}
            onClick={() => setFilter("READING")}
          >
            📖 Reading
          </button>
          <button
            className={filter === "LISTENING" ? "active" : ""}
            onClick={() => setFilter("LISTENING")}
          >
            🎧 Listening
          </button>
          <button
            className={filter === "FULL_TEST" ? "active" : ""}
            onClick={() => setFilter("FULL_TEST")}
          >
            📄 Full Test
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Exam Title</th>
              <th>Type</th>
              <th>Overall Score</th>
              <th>Reading</th>
              <th>Listening</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.resultId}>
                <td>{new Date(result.testDate).toLocaleDateString()}</td>
                <td>{result.examTitle}</td>
                <td>
                  <span className={`badge ${result.examType.toLowerCase()}`}>
                    {result.examType}
                  </span>
                </td>
                <td>
                  <span className="score-badge">
                    {result.totalScore.toFixed(1)}%
                  </span>
                  <div className="score-detail">
                    {result.totalCorrect}/{result.totalQuestions}
                  </div>
                </td>
                <td>
                  {result.readingBreakdown ? (
                    <div className="breakdown-cell">
                      <span>{result.readingBreakdown.score.toFixed(1)}%</span>
                      <small>
                        {result.readingBreakdown.correct}/
                        {result.readingBreakdown.total}
                      </small>
                    </div>
                  ) : (
                    <span className="text-muted">N/A</span>
                  )}
                </td>
                <td>
                  {result.listeningBreakdown ? (
                    <div className="breakdown-cell">
                      <span>{result.listeningBreakdown.score.toFixed(1)}%</span>
                      <small>
                        {result.listeningBreakdown.correct}/
                        {result.listeningBreakdown.total}
                      </small>
                    </div>
                  ) : (
                    <span className="text-muted">N/A</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn-detail"
                    onClick={() => setSelectedResult(result)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
```

### Result Detail Modal

```typescript
// components/admin/ResultDetailModal.tsx

import React from "react";
import { AdminExamResultDetail } from "@/types/admin-exam-results";

interface Props {
  result: AdminExamResultDetail;
  onClose: () => void;
}

export const ResultDetailModal: React.FC<Props> = ({ result, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Exam Result Detail</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* User Info */}
          <div className="info-section">
            <h3>User Information</h3>
            <div className="info-grid">
              <div>
                <label>Name:</label>
                <span>{result.userName}</span>
              </div>
              <div>
                <label>Email:</label>
                <span>{result.userEmail}</span>
              </div>
            </div>
          </div>

          {/* Exam Info */}
          <div className="info-section">
            <h3>Exam Information</h3>
            <div className="info-grid">
              <div>
                <label>Title:</label>
                <span>{result.examTitle}</span>
              </div>
              <div>
                <label>Type:</label>
                <span className={`badge ${result.examType.toLowerCase()}`}>
                  {result.examType}
                </span>
              </div>
              <div>
                <label>Date:</label>
                <span>{new Date(result.testDate).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="score-section">
            <h3>Overall Performance</h3>
            <div className="score-display">
              <div className="score-circle">
                <div className="score-value">
                  {result.totalScore.toFixed(1)}%
                </div>
                <div className="score-label">Total Score</div>
              </div>
              <div className="score-stats">
                <div className="stat">
                  <span className="stat-label">Correct:</span>
                  <span className="stat-value">{result.totalCorrect}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Incorrect:</span>
                  <span className="stat-value">{result.totalIncorrect}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{result.totalQuestions}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Accuracy:</span>
                  <span className="stat-value">
                    {result.accuracy.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown for Full Test */}
          {(result.readingBreakdown || result.listeningBreakdown) && (
            <div className="breakdown-section">
              <h3>Skills Breakdown</h3>
              <div className="breakdown-grid">
                {result.readingBreakdown && (
                  <div className="breakdown-card reading">
                    <h4>📖 Reading</h4>
                    <div className="breakdown-score">
                      {result.readingBreakdown.score.toFixed(1)}%
                    </div>
                    <div className="breakdown-details">
                      <p>
                        Correct: {result.readingBreakdown.correct} /{" "}
                        {result.readingBreakdown.total}
                      </p>
                      <p>
                        Accuracy: {result.readingBreakdown.accuracy.toFixed(1)}%
                      </p>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${result.readingBreakdown.accuracy}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {result.listeningBreakdown && (
                  <div className="breakdown-card listening">
                    <h4>🎧 Listening</h4>
                    <div className="breakdown-score">
                      {result.listeningBreakdown.score.toFixed(1)}%
                    </div>
                    <div className="breakdown-details">
                      <p>
                        Correct: {result.listeningBreakdown.correct} /{" "}
                        {result.listeningBreakdown.total}
                      </p>
                      <p>
                        Accuracy:{" "}
                        {result.listeningBreakdown.accuracy.toFixed(1)}%
                      </p>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${result.listeningBreakdown.accuracy}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary">Export PDF</button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔍 Search & Filter Interface

```typescript
// components/admin/ExamResultsSearch.tsx

import React, { useState, useEffect } from "react";
import { adminExamService } from "@/services/admin-exam.service";
import {
  AdminExamResultDetail,
  ExamResultSearchFilters,
  PageResponse,
} from "@/types/admin-exam-results";

export const ExamResultsSearch: React.FC = () => {
  const [results, setResults] =
    useState<PageResponse<AdminExamResultDetail> | null>(null);
  const [filters, setFilters] = useState<ExamResultSearchFilters>({
    page: 0,
    size: 20,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchResults();
  }, [filters.page]);

  const searchResults = async () => {
    try {
      setLoading(true);
      const data = await adminExamService.searchExamResults(filters);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    key: keyof ExamResultSearchFilters,
    value: any
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  return (
    <div className="exam-results-search">
      {/* Search Filters */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by user name..."
          value={filters.userName || ""}
          onChange={(e) => handleFilterChange("userName", e.target.value)}
        />

        <select
          value={filters.examType || ""}
          onChange={(e) =>
            handleFilterChange("examType", e.target.value || undefined)
          }
        >
          <option value="">All Types</option>
          <option value="READING">Reading</option>
          <option value="LISTENING">Listening</option>
          <option value="FULL_TEST">Full Test</option>
        </select>

        <input
          type="number"
          placeholder="Min Score"
          value={filters.minScore || ""}
          onChange={(e) =>
            handleFilterChange(
              "minScore",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
        />

        <input
          type="number"
          placeholder="Max Score"
          value={filters.maxScore || ""}
          onChange={(e) =>
            handleFilterChange(
              "maxScore",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
        />

        <button onClick={searchResults}>🔍 Search</button>
      </div>

      {/* Results Table */}
      {results && (
        <div>
          <table className="results-table">
            {/* Table headers and rows similar to UserResultsView */}
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              disabled={filters.page === 0}
              onClick={() =>
                handleFilterChange("page", (filters.page || 0) - 1)
              }
            >
              Previous
            </button>
            <span>
              Page {(filters.page || 0) + 1} of {results.totalPages}
            </span>
            <button
              disabled={(filters.page || 0) >= results.totalPages - 1}
              onClick={() =>
                handleFilterChange("page", (filters.page || 0) + 1)
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 📊 Charts & Visualizations

```typescript
// components/admin/TrendsCharts.tsx

import React from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AdminDashboardAnalytics } from "@/types/admin-exam-results";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  analytics: AdminDashboardAnalytics;
}

export const TrendsCharts: React.FC<Props> = ({ analytics }) => {
  // Exam Trends Bar Chart
  const examTrendsData = {
    labels: analytics.examTrends.labels,
    datasets: [
      {
        label: "Reading Exams",
        data: analytics.examTrends.readingExams,
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 2,
      },
      {
        label: "Listening Exams",
        data: analytics.examTrends.listeningExams,
        backgroundColor: "rgba(245, 158, 11, 0.6)",
        borderColor: "rgb(245, 158, 11)",
        borderWidth: 2,
      },
      {
        label: "Full Test Exams",
        data: analytics.examTrends.fullTestExams,
        backgroundColor: "rgba(239, 68, 68, 0.6)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 2,
      },
    ],
  };

  // Score Trends Line Chart
  const scoreTrendsData = {
    labels: analytics.averageScoreTrends.labels,
    datasets: [
      {
        label: "Reading Scores",
        data: analytics.averageScoreTrends.readingScores,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
      {
        label: "Listening Scores",
        data: analytics.averageScoreTrends.listeningScores,
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
      },
      {
        label: "Full Test Scores",
        data: analytics.averageScoreTrends.fullTestScores,
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // User Engagement Doughnut Chart
  const userEngagementData = {
    labels: ["Active Users", "New Users", "Returning Users"],
    datasets: [
      {
        data: [
          analytics.userEngagement.activeUsers,
          analytics.userEngagement.newUsers,
          analytics.userEngagement.returningUsers,
        ],
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="trends-charts">
      <div className="chart-container">
        <h3>Exam Activity Trends</h3>
        <Bar
          data={examTrendsData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>

      <div className="chart-container">
        <h3>Average Score Trends</h3>
        <Line
          data={scoreTrendsData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: (value) => `${value}%`,
                },
              },
            },
          }}
        />
      </div>

      <div className="chart-container small">
        <h3>User Engagement</h3>
        <Doughnut
          data={userEngagementData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
};
```

---

## 📥 Export Functionality

```typescript
// utils/exportUtils.ts

import { AdminExamResultDetail } from "@/types/admin-exam-results";

export const exportToCSV = (
  results: AdminExamResultDetail[],
  filename: string
) => {
  const headers = [
    "Result ID",
    "User Name",
    "User Email",
    "Exam Title",
    "Exam Type",
    "Test Date",
    "Overall Score",
    "Overall Correct",
    "Overall Total",
    "Reading Score",
    "Reading Correct",
    "Reading Total",
    "Listening Score",
    "Listening Correct",
    "Listening Total",
  ];

  const csvContent = [
    headers.join(","),
    ...results.map((r) =>
      [
        r.resultId,
        `"${r.userName}"`,
        r.userEmail,
        `"${r.examTitle}"`,
        r.examType,
        r.testDate,
        r.totalScore.toFixed(2),
        r.totalCorrect,
        r.totalQuestions,
        r.readingBreakdown?.score.toFixed(2) || "",
        r.readingBreakdown?.correct || "",
        r.readingBreakdown?.total || "",
        r.listeningBreakdown?.score.toFixed(2) || "",
        r.listeningBreakdown?.correct || "",
        r.listeningBreakdown?.total || "",
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};
```

---

## 🎨 CSS Styles (Tailwind)

```css
/* styles/admin-dashboard.css */

.admin-dashboard {
  @apply p-6 max-w-7xl mx-auto;
}

.dashboard-header {
  @apply flex justify-between items-center mb-8;
}

.dashboard-header h1 {
  @apply text-3xl font-bold;
}

.period-selector button {
  @apply px-4 py-2 mx-1 rounded-lg border;
}

.period-selector button.active {
  @apply bg-indigo-600 text-white;
}

.statistics-cards {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6 mb-8;
}

.stat-card {
  @apply bg-white rounded-lg shadow-lg p-6 flex items-center gap-4;
}

.stat-card.blue {
  @apply border-l-4 border-indigo-600;
}

.stat-card.green {
  @apply border-l-4 border-green-600;
}

.stat-card.orange {
  @apply border-l-4 border-orange-600;
}

.stat-icon {
  @apply text-4xl;
}

.stat-value {
  @apply text-3xl font-bold;
}

.stat-breakdown {
  @apply flex flex-col gap-1 text-sm text-gray-600;
}

.results-table {
  @apply w-full border-collapse;
}

.results-table th {
  @apply bg-gray-100 p-3 text-left font-semibold;
}

.results-table td {
  @apply p-3 border-t;
}

.badge {
  @apply inline-block px-3 py-1 rounded-full text-sm font-semibold;
}

.badge.reading {
  @apply bg-green-100 text-green-800;
}

.badge.listening {
  @apply bg-orange-100 text-orange-800;
}

.badge.full_test {
  @apply bg-red-100 text-red-800;
}

.breakdown-cell {
  @apply flex flex-col;
}

.breakdown-cell span {
  @apply font-semibold;
}

.breakdown-cell small {
  @apply text-gray-500;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex justify-between items-center p-6 border-b;
}

.modal-body {
  @apply p-6;
}

.info-section {
  @apply mb-6;
}

.info-section h3 {
  @apply text-lg font-semibold mb-3;
}

.info-grid {
  @apply grid grid-cols-2 gap-4;
}

.breakdown-card {
  @apply bg-gray-50 rounded-lg p-4;
}

.breakdown-card.reading {
  @apply border-l-4 border-green-600;
}

.breakdown-card.listening {
  @apply border-l-4 border-orange-600;
}

.breakdown-score {
  @apply text-3xl font-bold my-2;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2 mt-2;
}

.progress-fill {
  @apply h-full bg-indigo-600 rounded-full transition-all duration-500;
}

.trends-charts {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8;
}

.chart-container {
  @apply bg-white rounded-lg shadow-lg p-6;
  height: 400px;
}

.chart-container.small {
  @apply lg:col-span-1;
  height: 300px;
}
```

---

## 🚀 Complete Next.js Page Example

```typescript
// app/admin/dashboard/page.tsx

"use client";

import React from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="admin-layout">
      <AdminDashboard />
    </div>
  );
}
```

---

## ✅ Implementation Checklist

- [ ] Install dependencies: `npm install axios chart.js react-chartjs-2 @tanstack/react-query`
- [ ] Copy TypeScript interfaces to `types/admin-exam-results.ts`
- [ ] Create API service in `services/admin-exam.service.ts`
- [ ] Create dashboard components
- [ ] Add CSS styles
- [ ] Test all endpoints with Postman
- [ ] Verify breakdown display for Full Test
- [ ] Test search & filter functionality
- [ ] Implement export to CSV
- [ ] Deploy to production

---

## 🎯 Key Features Summary

1. **Dashboard Overview**

   - Total users, exams, average scores
   - Breakdown by exam type
   - Top performers list
   - Recent activity feed

2. **User Results View**

   - Filter by exam type
   - **Reading/Listening breakdown for Full Test** ⭐
   - Click to view detailed modal
   - Export functionality

3. **Analytics Charts**

   - Exam activity trends (Bar chart)
   - Score trends over time (Line chart)
   - User engagement (Doughnut chart)

4. **Search & Filter**

   - Search by user name
   - Filter by exam type, score range, date range
   - Paginated results

5. **Export**
   - CSV export with breakdown columns
   - PDF report generation (optional)

---

**Version:** 1.0.0  
**Last Updated:** January 2, 2026  
**Status:** ✅ Production Ready
