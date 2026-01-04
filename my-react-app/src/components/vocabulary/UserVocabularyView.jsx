import React, { useState, useEffect } from 'react';
import { Volume2, BookmarkPlus, Loader2, Search } from 'lucide-react';
import vocabularyApi from '../../api/vocabularyApi';

const LEVEL_INFO = {
  BEGINNER: { icon: '🌱', label: 'Beginner', color: 'green' },
  INTERMEDIATE: { icon: '🌿', label: 'Intermediate', color: 'blue' },
  ADVANCED: { icon: '🌳', label: 'Advanced', color: 'purple' }
};

const UserVocabularyView = ({ articleId, onSaveToFlashcard }) => {
  const [vocabularies, setVocabularies] = useState({});
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    loadData();
  }, [articleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load vocabularies and counts in parallel
      const [vocabResponse, countResponse] = await Promise.all([
        vocabularyApi.getUserVocabularies(articleId),
        vocabularyApi.getVocabularyCount(articleId)
      ]);

      const vocabData = vocabResponse.data || vocabResponse;
      const countData = countResponse.data || countResponse;

      // If data is grouped by level
      if (vocabData.vocabularies) {
        setVocabularies(vocabData.vocabularies);
      } else if (Array.isArray(vocabData)) {
        // Group by level if returned as array
        const grouped = {
          BEGINNER: [],
          INTERMEDIATE: [],
          ADVANCED: []
        };
        vocabData.forEach(vocab => {
          if (grouped[vocab.level]) {
            grouped[vocab.level].push(vocab);
          }
        });
        setVocabularies(grouped);
      }

      setCounts(countData);
    } catch (error) {
      console.error('Error loading vocabularies:', error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (word) => {
    try {
      // Try to get audio from Dictionary API
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const audioPhonetic = data[0]?.phonetics?.find(p => p.audio);
        if (audioPhonetic?.audio) {
          const audio = new Audio(audioPhonetic.audio);
          audio.play();
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSaveToFlashcard = (vocab) => {
    if (onSaveToFlashcard) {
      onSaveToFlashcard({
        word: vocab.word,
        phonetic: vocab.phonetic,
        definition: vocab.vietnamese, // Use Vietnamese as definition for flashcard
        example: vocab.exampleSentence,
        exampleVietnamese: vocab.exampleVietnamese,
        partOfSpeech: vocab.partOfSpeech
      });
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Get filtered vocabularies
  const getFilteredVocabs = () => {
    let vocabs = [];
    
    if (activeLevel === 'ALL') {
      vocabs = Object.values(vocabularies).flat();
    } else {
      vocabs = vocabularies[activeLevel] || [];
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      vocabs = vocabs.filter(v =>
        v.word.toLowerCase().includes(term) ||
        v.vietnamese?.toLowerCase().includes(term) ||
        v.definition?.toLowerCase().includes(term)
      );
    }

    return vocabs;
  };

  const filteredVocabs = getFilteredVocabs();
  const totalCount = counts?.total || Object.values(vocabularies).reduce((sum, arr) => sum + arr.length, 0);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Đang tải từ vựng...</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-gray-600">Bài viết này chưa có từ vựng</p>
      </div>
    );
  }

  return (
    <div className="user-vocabulary-view">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📚 Từ Vựng Quan Trọng
        </h2>
        <p className="text-gray-600">
          Tổng cộng <span className="font-semibold">{totalCount}</span> từ vựng trong bài
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm từ vựng..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Level Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveLevel('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeLevel === 'ALL'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả ({totalCount})
          </button>
          {Object.entries(LEVEL_INFO).map(([level, info]) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeLevel === level
                  ? `bg-${info.color}-600 text-white`
                  : `bg-${info.color}-100 text-${info.color}-800 hover:bg-${info.color}-200`
              }`}
            >
              {info.icon} {info.label} ({counts?.byLevel?.[level] || vocabularies[level]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Grid */}
      {filteredVocabs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-600">Không tìm thấy từ vựng phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVocabs.map((vocab) => (
            <VocabularyCard
              key={vocab.id}
              vocab={vocab}
              isExpanded={expandedIds.includes(vocab.id)}
              onToggleExpand={() => toggleExpand(vocab.id)}
              onPlayAudio={() => playAudio(vocab.word)}
              onSaveToFlashcard={() => handleSaveToFlashcard(vocab)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Vocabulary Card Component
const VocabularyCard = ({ vocab, isExpanded, onToggleExpand, onPlayAudio, onSaveToFlashcard }) => {
  const levelInfo = LEVEL_INFO[vocab.level];

  return (
    <div
      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
      onClick={onToggleExpand}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-blue-600 truncate">
              {vocab.word}
            </h3>
            {vocab.phonetic && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio();
                }}
                className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                title="Phát âm"
              >
                <Volume2 className="text-blue-600" size={18} />
              </button>
            )}
          </div>
          
          {vocab.phonetic && (
            <p className="text-sm text-gray-500 italic mb-2">{vocab.phonetic}</p>
          )}
          
          <div className="flex items-center gap-2">
            {vocab.partOfSpeech && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                {vocab.partOfSpeech}
              </span>
            )}
            <span className={`px-2 py-0.5 bg-${levelInfo.color}-100 text-${levelInfo.color}-700 text-xs rounded-full`}>
              {levelInfo.icon} {levelInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Vietnamese Meaning */}
      <div className="mb-3">
        <p className="text-gray-900 font-medium">
          🇻🇳 {vocab.vietnamese}
        </p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3 border-t pt-3 animate-fadeIn">
          {vocab.definition && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Definition
              </p>
              <p className="text-sm text-gray-700">{vocab.definition}</p>
            </div>
          )}

          {vocab.exampleSentence && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Example
              </p>
              <div className="bg-gray-50 p-3 rounded space-y-1">
                <p className="text-sm text-gray-700 italic">
                  "{vocab.exampleSentence}"
                </p>
                {vocab.exampleVietnamese && (
                  <p className="text-xs text-gray-500">
                    → {vocab.exampleVietnamese}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {onSaveToFlashcard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveToFlashcard();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <BookmarkPlus size={16} />
              Lưu vào Flashcard
            </button>
          )}
        </div>
      )}

      {/* Expand Indicator */}
      {!isExpanded && (
        <div className="text-center text-xs text-gray-400 mt-2">
          Click để xem chi tiết →
        </div>
      )}
    </div>
  );
};

export default UserVocabularyView;
