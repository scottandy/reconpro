// This file is very large, so I'm only including the relevant parts that need to be updated

// Inside the InspectionSettings component, add a new tab for PDF settings:

// Add to the tab navigation section:
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

// Add a new tab content section for PDF settings:
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