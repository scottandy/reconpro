import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { CustomerComment } from '../utils/pdfGenerator';

interface CustomerCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comment: Omit<CustomerComment, 'id' | 'timestamp'>) => void;
  sections: Array<{ key: string, label: string }>;
}

const CustomerCommentModal: React.FC<CustomerCommentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  sections
}) => {
  const [formData, setFormData] = useState({
    section: '',
    comment: '',
    customerName: '',
    customerEmail: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.section) newErrors.section = 'Please select a section';
    if (!formData.comment.trim()) newErrors.comment = 'Comment is required';
    
    // Email validation if provided
    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSave({
      section: formData.section,
      comment: formData.comment.trim(),
      customerName: formData.customerName.trim() || undefined,
      customerEmail: formData.customerEmail.trim() || undefined
    });
    
    // Reset form
    setFormData({
      section: '',
      comment: '',
      customerName: '',
      customerEmail: ''
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-lg w-full border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Inspection Note</h3>
                <p className="text-sm text-gray-600">Add a note to the inspection report</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section *
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.section ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a section</option>
                <option value="General">General</option>
                {sections.map(section => (
                  <option key={section.key} value={section.label}>
                    {section.label}
                  </option>
                ))}
              </select>
              {errors.section && <p className="text-red-600 text-sm mt-1">{errors.section}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Enter inspection note or feedback..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.comment ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.comment && <p className="text-red-600 text-sm mt-1">{errors.comment}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Customer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="customer@example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.customerEmail ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.customerEmail && <p className="text-red-600 text-sm mt-1">{errors.customerEmail}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Add Note
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerCommentModal;