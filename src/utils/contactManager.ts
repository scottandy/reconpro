import { Contact, ContactCategory, ContactSettings, CONTACT_CATEGORY_CONFIGS } from '../types/contact';

export class ContactManager {
  private static readonly STORAGE_KEYS = {
    CONTACTS: 'dealership_contacts',
    CONTACT_SETTINGS: 'dealership_contact_settings',
    CALL_LOG: 'contact_call_log'
  };

  static initializeDefaultContacts(dealershipId: string): void {
    const existingContacts = this.getContacts(dealershipId);
    if (existingContacts.length > 0) return;

    const defaultContacts: Omit<Contact, 'id'>[] = [
      {
        name: 'Mike\'s Auto Body',
        company: 'Mike\'s Auto Body Shop',
        title: 'Owner',
        phone: '(555) 123-4567',
        email: 'mike@mikesautobody.com',
        address: '123 Main Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        category: 'body-shop',
        specialties: ['Paint Work', 'Collision Repair', 'Dent Removal'],
        notes: 'Excellent paint matching. Quick turnaround on minor repairs.',
        isFavorite: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Sarah Johnson',
        company: 'Elite Detailing Services',
        title: 'Manager',
        phone: '(555) 987-6543',
        email: 'sarah@elitedetailing.com',
        category: 'detailing',
        specialties: ['Interior Cleaning', 'Paint Correction', 'Ceramic Coating'],
        notes: 'Premium detailing services. Great for high-end vehicles.',
        isFavorite: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Tom\'s Transmission',
        company: 'Tom\'s Transmission & Auto Repair',
        title: 'Lead Mechanic',
        phone: '(555) 456-7890',
        email: 'info@tomstransmission.com',
        category: 'mechanic',
        specialties: ['Transmission Repair', 'Engine Diagnostics', 'Brake Service'],
        notes: 'Reliable for complex mechanical issues. Fair pricing.',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'AutoParts Plus',
        company: 'AutoParts Plus Distribution',
        title: 'Sales Representative',
        phone: '(555) 321-0987',
        email: 'orders@autopartsplus.com',
        category: 'parts-supplier',
        specialties: ['OEM Parts', 'Aftermarket Parts', 'Fast Delivery'],
        notes: 'Good inventory and competitive prices. Next-day delivery available.',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Quick Tow Services',
        company: 'Quick Tow & Recovery',
        title: 'Dispatcher',
        phone: '(555) 911-TOWS',
        email: 'dispatch@quicktow.com',
        category: 'towing',
        specialties: ['24/7 Service', 'Flatbed Towing', 'Vehicle Recovery'],
        notes: '24/7 availability. Reliable for emergency situations.',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const contacts = defaultContacts.map(contact => ({
      ...contact,
      id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    this.saveContacts(dealershipId, contacts);
  }

  static getContacts(dealershipId: string): Contact[] {
    const key = `${this.STORAGE_KEYS.CONTACTS}_${dealershipId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static saveContacts(dealershipId: string, contacts: Contact[]): void {
    const key = `${this.STORAGE_KEYS.CONTACTS}_${dealershipId}`;
    localStorage.setItem(key, JSON.stringify(contacts));
  }

  static addContact(dealershipId: string, contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
    const contacts = this.getContacts(dealershipId);
    const newContact: Contact = {
      ...contactData,
      id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    contacts.unshift(newContact);
    this.saveContacts(dealershipId, contacts);
    return newContact;
  }

  static updateContact(dealershipId: string, contactId: string, updates: Partial<Contact>): Contact | null {
    const contacts = this.getContacts(dealershipId);
    const index = contacts.findIndex(contact => contact.id === contactId);
    
    if (index === -1) return null;

    contacts[index] = {
      ...contacts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveContacts(dealershipId, contacts);
    return contacts[index];
  }

  static deleteContact(dealershipId: string, contactId: string): boolean {
    const contacts = this.getContacts(dealershipId);
    const filteredContacts = contacts.filter(contact => contact.id !== contactId);
    
    if (filteredContacts.length === contacts.length) return false;

    this.saveContacts(dealershipId, filteredContacts);
    return true;
  }

  static toggleFavorite(dealershipId: string, contactId: string): boolean {
    const contacts = this.getContacts(dealershipId);
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) return false;

    contact.isFavorite = !contact.isFavorite;
    contact.updatedAt = new Date().toISOString();
    
    this.saveContacts(dealershipId, contacts);
    return contact.isFavorite;
  }

  static logCall(dealershipId: string, contactId: string): void {
    const contacts = this.getContacts(dealershipId);
    const contact = contacts.find(c => c.id === contactId);
    
    if (contact) {
      contact.lastContacted = new Date().toISOString();
      contact.updatedAt = new Date().toISOString();
      this.saveContacts(dealershipId, contacts);
    }

    // Log the call
    const callLog = this.getCallLog(dealershipId);
    callLog.unshift({
      id: `call-${Date.now()}`,
      contactId,
      timestamp: new Date().toISOString(),
      contactName: contact?.name || 'Unknown'
    });

    // Keep only last 100 calls
    if (callLog.length > 100) {
      callLog.splice(100);
    }

    const key = `${this.STORAGE_KEYS.CALL_LOG}_${dealershipId}`;
    localStorage.setItem(key, JSON.stringify(callLog));
  }

  static getCallLog(dealershipId: string): Array<{id: string, contactId: string, timestamp: string, contactName: string}> {
    const key = `${this.STORAGE_KEYS.CALL_LOG}_${dealershipId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static getContactsByCategory(dealershipId: string, category: ContactCategory): Contact[] {
    return this.getContacts(dealershipId).filter(contact => contact.category === category && contact.isActive);
  }

  static getFavoriteContacts(dealershipId: string): Contact[] {
    return this.getContacts(dealershipId).filter(contact => contact.isFavorite && contact.isActive);
  }

  static searchContacts(dealershipId: string, query: string): Contact[] {
    const contacts = this.getContacts(dealershipId);
    const searchTerm = query.toLowerCase();
    
    return contacts.filter(contact => 
      contact.isActive && (
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.company?.toLowerCase().includes(searchTerm) ||
        contact.phone.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.specialties?.some(specialty => specialty.toLowerCase().includes(searchTerm))
      )
    );
  }

  static getContactStats(dealershipId: string): {
    total: number;
    active: number;
    favorites: number;
    byCategory: Record<ContactCategory, number>;
  } {
    const contacts = this.getContacts(dealershipId);
    const active = contacts.filter(contact => contact.isActive);
    const favorites = contacts.filter(contact => contact.isFavorite && contact.isActive);
    
    const byCategory = Object.keys(CONTACT_CATEGORY_CONFIGS).reduce((acc, category) => {
      acc[category as ContactCategory] = contacts.filter(contact => 
        contact.category === category && contact.isActive
      ).length;
      return acc;
    }, {} as Record<ContactCategory, number>);

    return {
      total: contacts.length,
      active: active.length,
      favorites: favorites.length,
      byCategory
    };
  }

  static getContactSettings(dealershipId: string): ContactSettings {
    const key = `${this.STORAGE_KEYS.CONTACT_SETTINGS}_${dealershipId}`;
    const data = localStorage.getItem(key);
    
    if (data) {
      return JSON.parse(data);
    }

    // Default settings
    const defaultSettings: ContactSettings = {
      defaultCategory: 'other',
      autoSaveContacts: true,
      showFavoritesFirst: true,
      enableCallLogging: true
    };

    this.saveContactSettings(dealershipId, defaultSettings);
    return defaultSettings;
  }

  static saveContactSettings(dealershipId: string, settings: ContactSettings): void {
    const key = `${this.STORAGE_KEYS.CONTACT_SETTINGS}_${dealershipId}`;
    localStorage.setItem(key, JSON.stringify(settings));
  }

  static getCategoryConfig(category: ContactCategory) {
    return CONTACT_CATEGORY_CONFIGS[category];
  }

  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    return phone; // Return original if not 10 digits
  }

  static makePhoneCall(phone: string): void {
    // Create tel: link for mobile devices
    const cleanPhone = phone.replace(/\D/g, '');
    window.location.href = `tel:${cleanPhone}`;
  }
}