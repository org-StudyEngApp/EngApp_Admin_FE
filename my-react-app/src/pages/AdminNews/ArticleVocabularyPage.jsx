import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import VocabularyManager from '../../components/vocabulary/VocabularyManager';
import articleApi from '../../api/articleApi';

const ArticleVocabularyPage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await articleApi.getArticleById(articleId);
      const data = response.data || response;
      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">Không tìm thấy bài viết</p>
          <Link
            to="/admin/articles"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/articles')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách bài viết
        </button>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {article.level}
                </span>
                {article.published ? (
                  <span className="text-green-600">● Published</span>
                ) : (
                  <span className="text-gray-400">● Draft</span>
                )}
                <span>
                  ID: {article.id}
                </span>
              </div>
            </div>
            
            <Link
              to={`/admin/articles/${articleId}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Chỉnh sửa bài viết
            </Link>
          </div>
        </div>
      </div>

      {/* Vocabulary Manager */}
      <VocabularyManager
        articleId={articleId}
        articleTitle={article.title}
      />
    </div>
  );
};

export default ArticleVocabularyPage;
