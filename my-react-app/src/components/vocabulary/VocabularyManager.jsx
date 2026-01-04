import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square,
  FileSpreadsheet
} from 'lucide-react';
import vocabularyApi from '../../api/vocabularyApi';
import ImportVocabularyModal from './ImportVocabularyModal';

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const LEVEL_COLORS = {
  BEGINNER: 'bg-green-100 text-green-800 border-green-300',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-300',
  ADVANCED: 'bg-purple-100 text-purple-800 border-purple-300'
};

const VocabularyManager = ({ articleId, articleTitle }) => {
  const [vocabularies, setVocabularies] = useState({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeLevel, setActiveLevel] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [addForm, setAddForm] = useState({
    word: '',
    phonetic: '',
    partOfSpeech: '',
    definition: '',
    vietnamese: '',
    exampleSentence: '',
    exampleVietnamese: '',
    level: 'BEGINNER',
    notes: ''
  });
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    loadVocabularies();
  }, [articleId]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
  };

  const loadVocabularies = async () => {
    try {
      setLoading(true);
      const response = await vocabularyApi.getAdminVocabularies(articleId);
      const data = response.data || response;
      
      // Group by level
      const grouped = {
        BEGINNER: [],
        INTERMEDIATE: [],
        ADVANCED: []
      };
      
      if (Array.isArray(data)) {
        data.forEach(vocab => {
          if (grouped[vocab.level]) {
            grouped[vocab.level].push(vocab);
          }
        });
      }
      
      setVocabularies(grouped);
    } catch (error) {
      console.error('Error loading vocabularies:', error);
      showNotification('error', 'Không thể tải vocabulary');
    } finally {
      setLoading(false);
    }
  };

  // Generate vocabulary with Gemini AI
  const handleGenerate = async (level = null, replaceExisting = false) => {
    const confirmMsg = replaceExisting 
      ? `Xóa vocabulary cũ và generate mới cho ${level || 'tất cả levels'}?`
      : `Generate vocabulary cho ${level || 'tất cả levels'}?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      setGenerating(true);
      const response = await vocabularyApi.generateVocabulary({
        articleId: parseInt(articleId),
        level: level,
        wordsPerLevel: 15,
        replaceExisting: replaceExisting
      });

      const data = response.data || response;
      showNotification('success', `✨ Đã generate ${data.totalGenerated || 0} từ vựng!`);
      await loadVocabularies();
    } catch (error) {
      console.error('Error generating vocabulary:', error);
      showNotification('error', error.response?.data?.error || 'Không thể generate vocabulary');
    } finally {
      setGenerating(false);
    }
  };

  // Create vocabulary manually
  const handleCreate = async () => {
    if (!addForm.word.trim() || !addForm.vietnamese.trim()) {
      showNotification('error', 'Vui lòng nhập từ và nghĩa tiếng Việt');
      return;
    }

    try {
      await vocabularyApi.createVocabulary(articleId, addForm);
      showNotification('success', 'Đã thêm vocabulary mới');
      setShowAddModal(false);
      setAddForm({
        word: '',
        phonetic: '',
        partOfSpeech: '',
        definition: '',
        vietnamese: '',
        exampleSentence: '',
        exampleVietnamese: '',
        level: 'BEGINNER',
        notes: ''
      });
      await loadVocabularies();
    } catch (error) {
      console.error('Error creating vocabulary:', error);
      showNotification('error', 'Không thể tạo vocabulary');
    }
  };

  // Update vocabulary
  const handleUpdate = async (id) => {
    try {
      await vocabularyApi.updateVocabulary(id, editForm);
      showNotification('success', 'Đã cập nhật vocabulary');
      setEditingId(null);
      setEditForm({});
      await loadVocabularies();
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      showNotification('error', 'Không thể cập nhật vocabulary');
    }
  };

  // Delete vocabulary
  const handleDelete = async (id) => {
    if (!window.confirm('Xóa vocabulary này?')) return;

    try {
      await vocabularyApi.deleteVocabulary(id);
      showNotification('success', 'Đã xóa vocabulary');
      await loadVocabularies();
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      showNotification('error', 'Không thể xóa vocabulary');
    }
  };

  // Delete all vocabularies
  const handleDeleteAll = async (level = null) => {
    const confirmMsg = level 
      ? `Xóa TẤT CẢ vocabulary ở level ${level}?`
      : 'Xóa TẤT CẢ vocabulary của bài này?';
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await vocabularyApi.deleteAllVocabularies(articleId, level);
      showNotification('success', 'Đã xóa tất cả vocabulary');
      await loadVocabularies();
    } catch (error) {
      console.error('Error deleting all vocabularies:', error);
      showNotification('error', 'Không thể xóa vocabulary');
    }
  };

  // Approve single vocabulary
  const handleApprove = async (id) => {
    try {
      await vocabularyApi.approveVocabulary(id);
      showNotification('success', 'Đã approve vocabulary');
      await loadVocabularies();
    } catch (error) {
      console.error('Error approving vocabulary:', error);
      showNotification('error', 'Không thể approve vocabulary');
    }
  };

  // Batch approve
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;

    try {
      await vocabularyApi.batchApproveVocabularies(selectedIds);
      showNotification('success', `Đã approve ${selectedIds.length} vocabulary`);
      setSelectedIds([]);
      await loadVocabularies();
    } catch (error) {
      console.error('Error batch approving:', error);
      showNotification('error', 'Không thể approve vocabulary');
    }
  };

  // Reorder
  const handleReorder = async (level, fromIndex, toIndex) => {
    const levelVocabs = [...vocabularies[level]];
    const [moved] = levelVocabs.splice(fromIndex, 1);
    levelVocabs.splice(toIndex, 0, moved);

    // Optimistically update UI
    setVocabularies({
      ...vocabularies,
      [level]: levelVocabs
    });

    try {
      const ids = levelVocabs.map(v => v.id);
      await vocabularyApi.reorderVocabularies(articleId, level, ids);
      showNotification('success', 'Đã thay đổi thứ tự');
    } catch (error) {
      console.error('Error reordering:', error);
      showNotification('error', 'Không thể thay đổi thứ tự');
      await loadVocabularies(); // Reload on error
    }
  };

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Get filtered vocabularies
  const getDisplayVocabs = () => {
    if (activeLevel === 'ALL') {
      return vocabularies;
    }
    return { [activeLevel]: vocabularies[activeLevel] || [] };
  };

  const displayVocabs = getDisplayVocabs();
  const totalCount = Object.values(vocabularies).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="vocabulary-manager bg-white rounded-lg shadow-md p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-md animate-slide-in ${
          notification.type === 'success' ? 'bg-green-50 border-green-200' : 
          notification.type === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        } border rounded-lg shadow-lg p-4 flex items-start gap-3`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
          ) : notification.type === 'error' ? (
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          ) : (
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          )}
          <p className={`text-sm ${
            notification.type === 'success' ? 'text-green-800' : 
            notification.type === 'error' ? 'text-red-800' :
            'text-blue-800'
          }`}>
            {notification.message}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">📚 Quản lý Vocabulary</h2>
          <div className="text-sm text-gray-600">
            Bài: <span className="font-medium">{articleTitle}</span>
          </div>
        </div>
        <p className="text-gray-600">Tổng: {totalCount} từ vựng</p>
      </div>

      {/* Actions */}
      <div className="mb-6 space-y-4">
        {/* Generate Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleGenerate(null, false)}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Đang generate...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                ✨ Generate All với AI
              </>
            )}
          </button>

          <button
            onClick={() => handleGenerate(null, true)}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            🔄 Replace & Generate
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Thêm thủ công
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <FileSpreadsheet size={18} />
            📥 Import Excel
          </button>
        </div>

        {/* Level-specific actions */}
        <div className="flex flex-wrap items-center gap-2">
          {LEVELS.map(level => (
            <button
              key={level}
              onClick={() => handleGenerate(level, true)}
              disabled={generating}
              className={`px-3 py-1 text-sm rounded-lg border-2 ${LEVEL_COLORS[level]} hover:opacity-80 disabled:opacity-50 transition-opacity`}
            >
              Generate {level}
            </button>
          ))}
        </div>

        {/* Batch Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              Đã chọn {selectedIds.length} từ
            </span>
            <button
              onClick={handleBatchApprove}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <Check size={16} />
              Approve tất cả
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
            >
              <X size={16} />
              Bỏ chọn
            </button>
          </div>
        )}
      </div>

      {/* Level Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveLevel('ALL')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeLevel === 'ALL' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tất cả ({totalCount})
        </button>
        {LEVELS.map(level => (
          <button
            key={level}
            onClick={() => setActiveLevel(level)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeLevel === level
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {level} ({vocabularies[level]?.length || 0})
          </button>
        ))}
      </div>

      {/* Vocabularies List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải vocabulary...</p>
        </div>
      ) : totalCount === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-600 mb-4">Chưa có vocabulary nào</p>
          <button
            onClick={() => handleGenerate()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="inline mr-2" size={18} />
            Generate với AI
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(displayVocabs).map(([level, vocabs]) => (
            <VocabularyLevelSection
              key={level}
              level={level}
              vocabularies={vocabs || []}
              selectedIds={selectedIds}
              editingId={editingId}
              editForm={editForm}
              onToggleSelect={toggleSelect}
              onStartEdit={(vocab) => {
                setEditingId(vocab.id);
                setEditForm(vocab);
              }}
              onCancelEdit={() => {
                setEditingId(null);
                setEditForm({});
              }}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onReorder={(fromIndex, toIndex) => handleReorder(level, fromIndex, toIndex)}
              onDeleteAll={() => handleDeleteAll(level)}
              onEditFormChange={setEditForm}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <VocabularyFormModal
          title="Thêm Vocabulary Mới"
          formData={addForm}
          onChange={setAddForm}
          onSave={handleCreate}
          onCancel={() => {
            setShowAddModal(false);
            setAddForm({
              word: '',
              phonetic: '',
              partOfSpeech: '',
              definition: '',
              vietnamese: '',
              exampleSentence: '',
              exampleVietnamese: '',
              level: 'BEGINNER',
              notes: ''
            });
          }}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportVocabularyModal
          articleId={articleId}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={loadVocabularies}
        />
      )}
    </div>
  );
};

// Level Section Component
const VocabularyLevelSection = ({
  level,
  vocabularies,
  selectedIds,
  editingId,
  editForm,
  onToggleSelect,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onApprove,
  onReorder,
  onDeleteAll,
  onEditFormChange
}) => {
  if (!vocabularies || vocabularies.length === 0) return null;

  const approvedCount = vocabularies.filter(v => v.approved).length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <div className={`px-4 py-3 ${LEVEL_COLORS[level]} border-b border-gray-300 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold">
            {level === 'BEGINNER' && '🌱'}
            {level === 'INTERMEDIATE' && '🌿'}
            {level === 'ADVANCED' && '🌳'}
            {' '}{level}
          </h3>
          <span className="text-sm">
            {vocabularies.length} từ ({approvedCount} approved)
          </span>
        </div>
        <button
          onClick={onDeleteAll}
          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
        >
          <Trash2 size={14} />
          Xóa tất cả
        </button>
      </div>

      {/* Vocabularies */}
      <div className="divide-y divide-gray-200">
        {vocabularies.map((vocab, index) => (
          <VocabularyRow
            key={vocab.id}
            vocab={vocab}
            index={index}
            total={vocabularies.length}
            isSelected={selectedIds.includes(vocab.id)}
            isEditing={editingId === vocab.id}
            editForm={editForm}
            onToggleSelect={() => onToggleSelect(vocab.id)}
            onStartEdit={() => onStartEdit(vocab)}
            onCancelEdit={onCancelEdit}
            onUpdate={() => onUpdate(vocab.id)}
            onDelete={() => onDelete(vocab.id)}
            onApprove={() => onApprove(vocab.id)}
            onMoveUp={() => index > 0 && onReorder(index, index - 1)}
            onMoveDown={() => index < vocabularies.length - 1 && onReorder(index, index + 1)}
            onEditFormChange={onEditFormChange}
          />
        ))}
      </div>
    </div>
  );
};

// Vocabulary Row Component
const VocabularyRow = ({
  vocab,
  index,
  total,
  isSelected,
  isEditing,
  editForm,
  onToggleSelect,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onApprove,
  onMoveUp,
  onMoveDown,
  onEditFormChange
}) => {
  if (isEditing) {
    return (
      <div className="p-4 bg-blue-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={editForm.word || ''}
            onChange={(e) => onEditFormChange({ ...editForm, word: e.target.value })}
            placeholder="Word *"
            className="px-3 py-2 border rounded"
          />
          <input
            type="text"
            value={editForm.phonetic || ''}
            onChange={(e) => onEditFormChange({ ...editForm, phonetic: e.target.value })}
            placeholder="Phonetic"
            className="px-3 py-2 border rounded"
          />
          <input
            type="text"
            value={editForm.partOfSpeech || ''}
            onChange={(e) => onEditFormChange({ ...editForm, partOfSpeech: e.target.value })}
            placeholder="Part of Speech"
            className="px-3 py-2 border rounded"
          />
          <input
            type="text"
            value={editForm.vietnamese || ''}
            onChange={(e) => onEditFormChange({ ...editForm, vietnamese: e.target.value })}
            placeholder="Nghĩa tiếng Việt *"
            className="px-3 py-2 border rounded"
          />
          <textarea
            value={editForm.definition || ''}
            onChange={(e) => onEditFormChange({ ...editForm, definition: e.target.value })}
            placeholder="Definition"
            className="px-3 py-2 border rounded md:col-span-2"
            rows={2}
          />
          <textarea
            value={editForm.exampleSentence || ''}
            onChange={(e) => onEditFormChange({ ...editForm, exampleSentence: e.target.value })}
            placeholder="Example Sentence"
            className="px-3 py-2 border rounded md:col-span-2"
            rows={2}
          />
          <textarea
            value={editForm.exampleVietnamese || ''}
            onChange={(e) => onEditFormChange({ ...editForm, exampleVietnamese: e.target.value })}
            placeholder="Ví dụ tiếng Việt"
            className="px-3 py-2 border rounded md:col-span-2"
            rows={2}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Check className="inline mr-1" size={16} /> Lưu
          </button>
          <button
            onClick={onCancelEdit}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            <X className="inline mr-1" size={16} /> Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button onClick={onToggleSelect} className="mt-1">
          {isSelected ? (
            <CheckSquare className="text-blue-600" size={20} />
          ) : (
            <Square className="text-gray-400" size={20} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-bold text-blue-600">{vocab.word}</h4>
            {vocab.phonetic && (
              <span className="text-sm text-gray-500 italic">{vocab.phonetic}</span>
            )}
            {vocab.partOfSpeech && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                {vocab.partOfSpeech}
              </span>
            )}
            {vocab.approved ? (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1">
                <Check size={12} /> Approved
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                Pending
              </span>
            )}
            {vocab.autoGenerated && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                AI Generated
              </span>
            )}
          </div>

          <div className="space-y-1 text-sm">
            {vocab.vietnamese && (
              <p className="text-gray-900">
                <strong>🇻🇳 Nghĩa:</strong> {vocab.vietnamese}
              </p>
            )}
            {vocab.definition && (
              <p className="text-gray-600">
                <strong>Definition:</strong> {vocab.definition}
              </p>
            )}
            {vocab.exampleSentence && (
              <p className="text-gray-600 italic">
                <strong>Example:</strong> "{vocab.exampleSentence}"
              </p>
            )}
            {vocab.exampleVietnamese && (
              <p className="text-gray-500 italic text-xs">
                → {vocab.exampleVietnamese}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Di chuyển lên"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Di chuyển xuống"
            >
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="flex gap-1">
            {!vocab.approved && (
              <button
                onClick={onApprove}
                className="p-1 hover:bg-green-100 rounded text-green-600"
                title="Approve"
              >
                <Check size={16} />
              </button>
            )}
            <button
              onClick={onStartEdit}
              className="p-1 hover:bg-blue-100 rounded text-blue-600"
              title="Chỉnh sửa"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:bg-red-100 rounded text-red-600"
              title="Xóa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Modal Component
const VocabularyFormModal = ({ title, formData, onChange, onSave, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Word <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) => onChange({ ...formData, word: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="example"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phonetic</label>
                <input
                  type="text"
                  value={formData.phonetic}
                  onChange={(e) => onChange({ ...formData, phonetic: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="/ɪɡˈzæmpl/"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Part of Speech</label>
                <input
                  type="text"
                  value={formData.partOfSpeech}
                  onChange={(e) => onChange({ ...formData, partOfSpeech: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="noun"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nghĩa tiếng Việt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vietnamese}
                  onChange={(e) => onChange({ ...formData, vietnamese: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="ví dụ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => onChange({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Definition</label>
              <textarea
                value={formData.definition}
                onChange={(e) => onChange({ ...formData, definition: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="A thing characteristic of its kind..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Example Sentence</label>
              <textarea
                value={formData.exampleSentence}
                onChange={(e) => onChange({ ...formData, exampleSentence: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="This is an example sentence."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ví dụ tiếng Việt</label>
              <textarea
                value={formData.exampleVietnamese}
                onChange={(e) => onChange({ ...formData, exampleVietnamese: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Đây là một câu ví dụ."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => onChange({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyManager;