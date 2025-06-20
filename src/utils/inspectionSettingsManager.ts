import { InspectionSettings, InspectionSection, InspectionItem, RatingLabel, DEFAULT_INSPECTION_SETTINGS } from '../types/inspectionSettings';

export class InspectionSettingsManager {
  private static readonly STORAGE_KEY = 'dealership_inspection_settings';

  static initializeDefaultSettings(dealershipId: string): void {
    const existingSettings = this.getSettings(dealershipId);
    if (existingSettings) return;

    const defaultSettings: InspectionSettings = {
      ...DEFAULT_INSPECTION_SETTINGS,
      id: `settings-${Date.now()}`,
      dealershipId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveSettings(dealershipId, defaultSettings);
  }

  static getSettings(dealershipId: string): InspectionSettings | null {
    const key = `${this.STORAGE_KEY}_${dealershipId}`;
    const data = localStorage.getItem(key);
    
    if (!data) return null;
    
    try {
      const storedSettings = JSON.parse(data);
      
      // Deep merge with default settings to ensure all properties exist
      const mergedSettings: InspectionSettings = {
        ...DEFAULT_INSPECTION_SETTINGS,
        ...storedSettings,
        // Ensure nested objects are properly merged
        customerPdfSettings: {
          ...DEFAULT_INSPECTION_SETTINGS.customerPdfSettings,
          ...(storedSettings.customerPdfSettings || {})
        },
        globalSettings: {
          ...DEFAULT_INSPECTION_SETTINGS.globalSettings,
          ...(storedSettings.globalSettings || {})
        },
        ratingLabels: storedSettings.ratingLabels && storedSettings.ratingLabels.length > 0 
          ? storedSettings.ratingLabels 
          : DEFAULT_INSPECTION_SETTINGS.ratingLabels,
        sections: storedSettings.sections || DEFAULT_INSPECTION_SETTINGS.sections
      };
      
      return mergedSettings;
    } catch (error) {
      console.error('Error parsing inspection settings:', error);
      return null;
    }
  }

  static saveSettings(dealershipId: string, settings: InspectionSettings): void {
    const key = `${this.STORAGE_KEY}_${dealershipId}`;
    const updatedSettings = {
      ...settings,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(updatedSettings));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: JSON.stringify(updatedSettings)
    }));
  }

  // Section Management
  static addSection(dealershipId: string, sectionData: Omit<InspectionSection, 'id' | 'createdAt' | 'updatedAt'>): InspectionSection {
    const settings = this.getSettings(dealershipId);
    if (!settings) throw new Error('Settings not found');

    const newSection: InspectionSection = {
      ...sectionData,
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    settings.sections.push(newSection);
    settings.sections.sort((a, b) => a.order - b.order);
    
    this.saveSettings(dealershipId, settings);
    return newSection;
  }

  static updateSection(dealershipId: string, sectionId: string, updates: Partial<InspectionSection>): InspectionSection | null {
    const settings = this.getSettings(dealershipId);
    if (!settings) return null;

    const sectionIndex = settings.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return null;

    settings.sections[sectionIndex] = {
      ...settings.sections[sectionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Re-sort if order changed
    if (updates.order !== undefined) {
      settings.sections.sort((a, b) => a.order - b.order);
    }

    this.saveSettings(dealershipId, settings);
    return settings.sections[sectionIndex];
  }

  static deleteSection(dealershipId: string, sectionId: string): boolean {
    const settings = this.getSettings(dealershipId);
    if (!settings) return false;

    const initialLength = settings.sections.length;
    settings.sections = settings.sections.filter(s => s.id !== sectionId);
    
    if (settings.sections.length < initialLength) {
      this.saveSettings(dealershipId, settings);
      return true;
    }
    return false;
  }

  static reorderSections(dealershipId: string, sectionIds: string[]): boolean {
    const settings = this.getSettings(dealershipId);
    if (!settings) return false;

    // Update order based on array position
    sectionIds.forEach((sectionId, index) => {
      const section = settings.sections.find(s => s.id === sectionId);
      if (section) {
        section.order = index + 1;
        section.updatedAt = new Date().toISOString();
      }
    });

    settings.sections.sort((a, b) => a.order - b.order);
    this.saveSettings(dealershipId, settings);
    return true;
  }

  // Item Management
  static addItem(dealershipId: string, sectionId: string, itemData: Omit<InspectionItem, 'id' | 'createdAt' | 'updatedAt'>): InspectionItem | null {
    const settings = this.getSettings(dealershipId);
    if (!settings) return null;

    const section = settings.sections.find(s => s.id === sectionId);
    if (!section) return null;

    const newItem: InspectionItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    section.items.push(newItem);
    section.items.sort((a, b) => a.order - b.order);
    section.updatedAt = new Date().toISOString();
    
    this.saveSettings(dealershipId, settings);
    return newItem;
  }

  static updateItem(dealershipId: string, sectionId: string, itemId: string, updates: Partial<InspectionItem>): InspectionItem | null {
    const settings = this.getSettings(dealershipId);
    if (!settings) return null;

    const section = settings.sections.find(s => s.id === sectionId);
    if (!section) return null;

    const itemIndex = section.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return null;

    section.items[itemIndex] = {
      ...section.items[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Re-sort if order changed
    if (updates.order !== undefined) {
      section.items.sort((a, b) => a.order - b.order);
    }

    section.updatedAt = new Date().toISOString();
    this.saveSettings(dealershipId, settings);
    return section.items[itemIndex];
  }

  static deleteItem(dealershipId: string, sectionId: string, itemId: string): boolean {
    const settings = this.getSettings(dealershipId);
    if (!settings) return false;

    const section = settings.sections.find(s => s.id === sectionId);
    if (!section) return false;

    const initialLength = section.items.length;
    section.items = section.items.filter(i => i.id !== itemId);
    
    if (section.items.length < initialLength) {
      section.updatedAt = new Date().toISOString();
      this.saveSettings(dealershipId, settings);
      return true;
    }
    return false;
  }

  static reorderItems(dealershipId: string, sectionId: string, itemIds: string[]): boolean {
    const settings = this.getSettings(dealershipId);
    if (!settings) return false;

    const section = settings.sections.find(s => s.id === sectionId);
    if (!section) return false;

    // Update order based on array position
    itemIds.forEach((itemId, index) => {
      const item = section.items.find(i => i.id === itemId);
      if (item) {
        item.order = index + 1;
        item.updatedAt = new Date().toISOString();
      }
    });

    section.items.sort((a, b) => a.order - b.order);
    section.updatedAt = new Date().toISOString();
    this.saveSettings(dealershipId, settings);
    return true;
  }

  // Rating Labels Management
  static updateRatingLabel(dealershipId: string, labelKey: 'great' | 'fair' | 'needs-attention' | 'not-checked', updates: Partial<RatingLabel>): RatingLabel | null {
    const settings = this.getSettings(dealershipId);
    if (!settings) return null;

    const labelIndex = settings.ratingLabels.findIndex(l => l.key === labelKey);
    if (labelIndex === -1) return null;

    settings.ratingLabels[labelIndex] = {
      ...settings.ratingLabels[labelIndex],
      ...updates
    };

    this.saveSettings(dealershipId, settings);
    return settings.ratingLabels[labelIndex];
  }

  // Customer PDF Settings Management
  static updateCustomerPdfSettings(dealershipId: string, updates: Partial<InspectionSettings['customerPdfSettings']>): boolean {
    const settings = this.getSettings(dealershipId);
    if (!settings) return false;

    settings.customerPdfSettings = {
      ...settings.customerPdfSettings,
      ...updates
    };

    this.saveSettings(dealershipId, settings);
    return true;
  }

  // Global Settings Management
  static updateGlobalSettings(dealershipId: string, updates: Partial<InspectionSettings['globalSettings']>): boolean {
    const settings = this.getSettings(dealershipId);
    if (!settings) return false;

    settings.globalSettings = {
      ...settings.globalSettings,
      ...updates
    };

    this.saveSettings(dealershipId, settings);
    return true;
  }

  // Utility Methods
  static getActiveSection(dealershipId: string): InspectionSection[] {
    const settings = this.getSettings(dealershipId);
    if (!settings) return [];

    return settings.sections
      .filter(section => section.isActive)
      .sort((a, b) => a.order - b.order);
  }

  static getActiveSectionItems(dealershipId: string, sectionId: string): InspectionItem[] {
    const settings = this.getSettings(dealershipId);
    if (!settings) return [];

    const section = settings.sections.find(s => s.id === sectionId);
    if (!section) return [];

    return section.items
      .filter(item => item.isActive)
      .sort((a, b) => a.order - b.order);
  }

  static getRatingLabel(dealershipId: string, labelKey: 'great' | 'fair' | 'needs-attention' | 'not-checked'): RatingLabel | null {
    const settings = this.getSettings(dealershipId);
    if (!settings) return null;

    return settings.ratingLabels.find(l => l.key === labelKey) || null;
  }

  static resetToDefaults(dealershipId: string): boolean {
    const defaultSettings: InspectionSettings = {
      ...DEFAULT_INSPECTION_SETTINGS,
      id: `settings-${Date.now()}`,
      dealershipId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveSettings(dealershipId, defaultSettings);
    return true;
  }

  // Export/Import Settings
  static exportSettings(dealershipId: string): string | null {
    const settings = this.getSettings(dealershipId);
    if (!settings) return null;

    return JSON.stringify(settings, null, 2);
  }

  static importSettings(dealershipId: string, settingsJson: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson);
      
      // Validate structure (basic validation)
      if (!importedSettings.sections || !importedSettings.ratingLabels || !importedSettings.globalSettings) {
        throw new Error('Invalid settings format');
      }

      const settings: InspectionSettings = {
        ...importedSettings,
        id: `settings-${Date.now()}`,
        dealershipId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.saveSettings(dealershipId, settings);
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }
}