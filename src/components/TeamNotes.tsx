import React, { useState } from 'react';
import { TeamNote } from '../types/vehicle';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Plus, Clock, User, Tag, CheckCircle2, Shield, FileText } from 'lucide-react';

interface TeamNotesProps {
  notes: TeamNote[];
  onAddNote: (note: Omit<TeamNote, 'id' | 'timestamp'>) => void;
}

const TeamNotes: React.FC<TeamNotesProps> = ({ notes, onAddNote }) => {
  const { user } = useAuth();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [category, setCategory] = useState<TeamNote['category']>('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim() && user?.initials) {
      onAddNote({
        text: newNote.trim(),
        userInitials: user.initials,
        category
      });
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'summary':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'emissions':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cosmetic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'mechanical':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cleaning':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'photos':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'summary':
        return 'Summary';
      case 'emissions':
        return 'Emissions';
      case 'cosmetic':
        return 'Cosmetic';
      case 'mechanical':
        return 'Mechanical';
      case 'cleaning':
        return 'Cleaning';
      case 'photos':
        return 'Photos';
      default:
        return 'General';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'summary':
        return FileText;
      default:
        return Tag;
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          Team Notes
        </h3>
        <button
          onClick={() => setIsAddingNote(true)}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {isAddingNote && (
        <form onSubmit={handleSubmit} className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/60">
          {/* User Info Display */}
          {user && (
            <div className="mb-3 sm:mb-4 p-3 bg-blue-50/80 rounded-lg border border-blue-200/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-xs">{user.initials}</span>
                </div>
                <span className="text-sm font-medium text-blue-800">
                  Adding note as: {user.firstName} {user.lastName}
                </span>
              </div>
            </div>
          )}

          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TeamNote['category'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="general">General</option>
              <option value="summary">Summary</option>
              <option value="emissions">Emissions</option>
              <option value="cosmetic">Cosmetic</option>
              <option value="mechanical">Mechanical</option>
              <option value="cleaning">Cleaning</option>
              <option value="photos">Photos</option>
            </select>
          </div>
          
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
              {category === 'summary' && (
                <span className="text-indigo-600 font-medium"> (This will appear in Vehicle Notes section)</span>
              )}
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={category === 'summary' 
                ? "Add a summary note about the vehicle's overall condition, key issues, or important information..."
                : "Add your note here..."
              }
              rows={category === 'summary' ? 4 : 3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              required
            />
            {category === 'summary' && (
              <p className="text-xs text-indigo-600 mt-1">
                💡 Summary notes will be displayed prominently in the Vehicle Notes section at the top of the page
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={!user?.initials || !newNote.trim()}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Note
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingNote(false);
                setNewNote('');
                setCategory('general');
              }}
              className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3 sm:space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm sm:text-base">No team notes yet. Add the first note to start tracking progress.</p>
          </div>
        ) : (
          notes
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((note) => {
              const CategoryIcon = getCategoryIcon(note.category);
              
              return (
                <div key={note.id} className={`border rounded-lg p-3 sm:p-4 transition-colors ${
                  note.category === 'summary' 
                    ? 'border-indigo-200/60 bg-indigo-50/50 hover:bg-indigo-50/80' 
                    : 'border-gray-200/60 hover:bg-gray-50/50'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        note.category === 'summary' ? 'bg-indigo-100' : 'bg-blue-100'
                      }`}>
                        <User className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          note.category === 'summary' ? 'text-indigo-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm sm:text-base">{note.userInitials}</span>
                          {note.isCertified && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Certified</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="truncate">{formatTimestamp(note.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    {note.category && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getCategoryColor(note.category)}`}>
                        <CategoryIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">{getCategoryLabel(note.category)}</span>
                        <span className="sm:hidden">{getCategoryLabel(note.category).slice(0, 3)}</span>
                      </span>
                    )}
                  </div>
                  <p className={`text-sm sm:text-base ml-8 sm:ml-11 ${
                    note.category === 'summary' ? 'text-indigo-900 font-medium' : 'text-gray-700'
                  }`}>
                    {note.text}
                  </p>
                  {note.category === 'summary' && (
                    <div className="ml-8 sm:ml-11 mt-2">
                      <div className="flex items-center gap-1 text-xs text-indigo-600">
                        <FileText className="w-3 h-3" />
                        <span>Displayed in Vehicle Notes section</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default TeamNotes;