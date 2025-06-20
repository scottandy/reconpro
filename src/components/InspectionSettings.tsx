import React, { useState, useEffect } from 'react';
import { FileText, Settings, Eye, Users } from 'lucide-react';
import { InspectionSettingsManager } from '../utils/inspectionSettingsManager';
import { useAuth } from '../contexts/AuthContext';
import type { InspectionSettings as InspectionSettingsType } from '../types/inspectionSettings';

const InspectionSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<InspectionSettingsType | null>(null);
  const [loading, setLoading] = useState(true);

  const dealership = user?.dealership;

  const loadSettings = async () => {
    if (!dealership) return;
    
    try {
      const dealershipSettings = await InspectionSettingsManager.getSettings(dealership.id);
      setSettings(dealershipSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [dealership]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load inspection settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Inspection Settings</h2>
        <p className="text-blue-100">Configure your inspection process and customer experience</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'general'
              ? 'bg-white text-blue-600 shadow-md border border-blue-100'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Settings className="w-5 h-5" />
          General
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'sections'
              ? 'bg-white text-blue-600 shadow-md border border-blue-100'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Eye className="w-5 h-5" />
          Sections
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'pdf'
              ? 'bg-white text-blue-600 shadow-md border border-blue-100'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <FileText className="w-5 h-5" />
          PDF Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">General Settings</h3>
          <div className="space-y-4">
            <p className="text-gray-600">General inspection settings will be configured here.</p>
          </div>
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Section Settings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.sections.map((section) => (
                <label key={section.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${section.color}`}>
                      <span>{section.icon}</span>
                      <span>{section.label}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) => {
                      if (dealership) {
                        InspectionSettingsManager.updateSection(dealership.id, section.id, {
                          enabled: e.target.checked
                        });
                        loadSettings();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pdf' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Customer PDF Settings</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Content Settings</h4>
                
                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Include Vehicle Photos</span>
                    <p className="text-sm text-gray-600">Add vehicle photos to the PDF report</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.customerPdfSettings?.includeVehiclePhotos}
                    onChange={(e) => {
                      if (dealership) {
                        InspectionSettingsManager.updateCustomerPdfSettings(dealership.id, {
                          includeVehiclePhotos: e.target.checked
                        });
                        loadSettings();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Include Customer Comments</span>
                    <p className="text-sm text-gray-600">Show customer comments in the PDF</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.customerPdfSettings?.includeCustomerComments}
                    onChange={(e) => {
                      if (dealership) {
                        InspectionSettingsManager.updateCustomerPdfSettings(dealership.id, {
                          includeCustomerComments: e.target.checked
                        });
                        loadSettings();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <div>
                    <span className="font-medium text-gray-900">Show Detailed Ratings</span>
                    <p className="text-sm text-gray-600">Display detailed item ratings in the PDF</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.customerPdfSettings?.showDetailedRatings}
                    onChange={(e) => {
                      if (dealership) {
                        InspectionSettingsManager.updateCustomerPdfSettings(dealership.id, {
                          showDetailedRatings: e.target.checked
                        });
                        loadSettings();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">PDF Customization</h4>
                
                <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                  <label className="block font-medium text-gray-900 mb-2">
                    Footer Text
                  </label>
                  <textarea
                    value={settings.customerPdfSettings?.footerText || ''}
                    onChange={(e) => {
                      if (dealership) {
                        InspectionSettingsManager.updateCustomerPdfSettings(dealership.id, {
                          footerText: e.target.value
                        });
                        loadSettings();
                      }
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter footer text for PDF reports..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This text will appear at the bottom of all customer PDF reports
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Section Visibility</h4>
              <p className="text-sm text-gray-600 mb-4">
                Control which sections appear in the customer PDF report
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.sections.map((section) => (
                  <label key={section.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${section.color}`}>
                        <span>{section.icon}</span>
                        <span>{section.label}</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={section.isCustomerVisible}
                      onChange={(e) => {
                        if (dealership) {
                          InspectionSettingsManager.updateSection(dealership.id, section.id, {
                            isCustomerVisible: e.target.checked
                          });
                          loadSettings();
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionSettings;