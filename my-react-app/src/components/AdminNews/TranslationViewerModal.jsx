import React, { useState, useEffect } from 'react';
import { X, Languages, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import articleApi from '../../api/articleApi';

const TranslationViewerModal = ({ article, isOpen, onClose }) => {
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('original'); // 'original' or 'translated'

  useEffect(() => {
    if (isOpen && article) {
      loadTranslation();
    }
  }, [isOpen, article]);

  const loadTranslation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Backend có thể trả về snake_case hoặc camelCase
      const existingTranslation = article.vietnameseTranslation || article.vietnamese_translation;
      
      // Nếu article đã có translation trong props, dùng luôn
      if (existingTranslation) {
        setTranslation(existingTranslation);
      } else {
        // Nếu chưa có, gọi API lấy stored translation
        const response = await articleApi.getStoredTranslation(article.id);
        const data = response.data || response.result || response;
        const fetchedTranslation = data.vietnameseTranslation || data.vietnamese_translation;
        setTranslation(fetchedTranslation);
      }
    } catch (err) {
      console.error('Error loading translation:', err);
      setError('Không thể tải bản dịch. Bài viết chưa được dịch.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Languages size={24} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Xem Bản Dịch</h2>
              <p className="text-sm text-gray-600 line-clamp-1">{article?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('original')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'original'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText size={18} />
              <span>Bản Gốc (English)</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('translated')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'translated'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Languages size={18} />
              <span>Bản Dịch (Tiếng Việt)</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" />
              <p className="text-gray-600">Đang tải bản dịch...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 text-center">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              {/* Original Tab Content */}
              {activeTab === 'original' && (
                <div className="prose max-w-none">
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={16} />
                    <span>Nội dung tiếng Anh gốc</span>
                  </div>
                  <div 
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                    dangerouslySetInnerHTML={{ __html: article?.htmlContent || article?.content || '<p>Không có nội dung</p>' }}
                  />
                </div>
              )}

              {/* Translated Tab Content */}
              {activeTab === 'translated' && (
                <div className="prose max-w-none">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Languages size={16} />
                      <span>Bản dịch tiếng Việt</span>
                    </div>
                    {translation && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle size={14} />
                        <span>Đã dịch</span>
                      </div>
                    )}
                  </div>
                  <div 
                    className="bg-blue-50 rounded-lg p-6 border border-blue-200"
                    dangerouslySetInnerHTML={{ __html: translation || '<p class="text-gray-500">Chưa có bản dịch</p>' }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {translation ? (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                Bản dịch sẵn sàng cho user
              </span>
            ) : (
              <span className="text-orange-600">Chưa có bản dịch</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationViewerModal;
