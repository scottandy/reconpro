import { User, Dealership, AuthState, LoginCredentials, RegisterDealershipData, RegisterUserData } from '../types/auth';

export class AuthManager {
  private static readonly STORAGE_KEYS = {
    DEALERSHIPS: 'dealerships',
    USERS: 'users',
    CURRENT_SESSION: 'currentSession',
    VEHICLE_DATA_PREFIX: 'dealership_vehicles_'
  };

  // Initialize with demo data
  static initializeDemoData(): void {
    // Always reinitialize to ensure super admin exists
    console.log('🔧 Initializing demo data...');
    
    const demoDealerships: Dealership[] = [
      // Super Admin "Dealership" - Platform Management
      {
        id: 'platform-admin',
        name: 'ReconPro Platform',
        address: '1 Platform Drive',
        city: 'Tech City',
        state: 'CA',
        zipCode: '94000',
        phone: '(555) 000-0000',
        email: 'platform@reconpro.com',
        website: 'https://reconpro.com',
        isActive: true,
        subscriptionPlan: 'enterprise',
        createdAt: new Date().toISOString(),
        settings: {
          allowUserRegistration: true,
          requireApproval: false,
          maxUsers: 999,
          features: {
            analytics: true,
            multiLocation: true,
            customReports: true,
            apiAccess: true
          }
        }
      },
      {
        id: 'demo-dealership-1',
        name: 'Premier Auto Group',
        address: '123 Main Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        phone: '(555) 123-4567',
        email: 'info@premierauto.com',
        website: 'https://premierauto.com',
        isActive: true,
        subscriptionPlan: 'premium',
        createdAt: new Date().toISOString(),
        settings: {
          allowUserRegistration: true,
          requireApproval: false,
          maxUsers: 50,
          features: {
            analytics: true,
            multiLocation: true,
            customReports: true,
            apiAccess: false
          }
        }
      },
      {
        id: 'demo-dealership-2',
        name: 'City Motors',
        address: '456 Oak Avenue',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        phone: '(555) 987-6543',
        email: 'contact@citymotors.com',
        isActive: true,
        subscriptionPlan: 'basic',
        createdAt: new Date().toISOString(),
        settings: {
          allowUserRegistration: false,
          requireApproval: true,
          maxUsers: 10,
          features: {
            analytics: false,
            multiLocation: false,
            customReports: false,
            apiAccess: false
          }
        }
      }
    ];

    const demoUsers: User[] = [
      // Super Admin User
      {
        id: 'super-admin-1',
        email: 'admin@reconpro.com',
        firstName: 'Super',
        lastName: 'Admin',
        initials: 'SA',
        role: 'admin',
        dealershipId: 'platform-admin',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      // Premier Auto Group users
      {
        id: 'user-1',
        email: 'admin@premierauto.com',
        firstName: 'John',
        lastName: 'Smith',
        initials: 'JS',
        role: 'admin',
        dealershipId: 'demo-dealership-1',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-2',
        email: 'manager@premierauto.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        initials: 'SJ',
        role: 'manager',
        dealershipId: 'demo-dealership-1',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-3',
        email: 'tech@premierauto.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        initials: 'MW',
        role: 'technician',
        dealershipId: 'demo-dealership-1',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      // City Motors users
      {
        id: 'user-4',
        email: 'admin@citymotors.com',
        firstName: 'Lisa',
        lastName: 'Davis',
        initials: 'LD',
        role: 'admin',
        dealershipId: 'demo-dealership-2',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-5',
        email: 'sales@citymotors.com',
        firstName: 'Tom',
        lastName: 'Brown',
        initials: 'TB',
        role: 'sales',
        dealershipId: 'demo-dealership-2',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    // Always overwrite to ensure consistency
    localStorage.setItem(this.STORAGE_KEYS.DEALERSHIPS, JSON.stringify(demoDealerships));
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
    
    console.log('✅ Demo data initialized');
    console.log('🏆 Super Admin:', demoUsers[0]);
  }

  static async login(credentials: LoginCredentials): Promise<{ user: User; dealership: Dealership }> {
    console.log('🔐 Login attempt for:', credentials.email);
    
    const users = this.getUsers();
    const dealerships = this.getDealerships();

    console.log('👥 Available users:', users.map(u => ({ email: u.email, dealership: u.dealershipId })));

    // Find user by email (case insensitive)
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.isActive);
    
    if (!user) {
      console.log('❌ User not found for email:', credentials.email);
      throw new Error('Invalid email or password');
    }

    console.log('✅ User found:', user);

    // Find dealership
    const dealership = dealerships.find(d => d.id === user.dealershipId && d.isActive);
    if (!dealership) {
      console.log('❌ Dealership not found for ID:', user.dealershipId);
      throw new Error('Dealership not found or inactive');
    }

    console.log('✅ Dealership found:', dealership);

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.updateUser(user);

    // Store session
    const session = { userId: user.id, dealershipId: dealership.id };
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));

    console.log('🎉 Login successful!');
    return { user, dealership };
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
  }

  static getCurrentSession(): { user: User; dealership: Dealership } | null {
    const sessionData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
    if (!sessionData) return null;

    try {
      const session = JSON.parse(sessionData);
      const users = this.getUsers();
      const dealerships = this.getDealerships();

      const user = users.find(u => u.id === session.userId && u.isActive);
      const dealership = dealerships.find(d => d.id === session.dealershipId && d.isActive);

      if (user && dealership) {
        return { user, dealership };
      }
    } catch (error) {
      console.error('Error parsing session:', error);
    }

    return null;
  }

  static async registerDealership(data: RegisterDealershipData): Promise<{ user: User; dealership: Dealership }> {
    const dealerships = this.getDealerships();
    const users = this.getUsers();

    // Check if dealership email already exists
    if (dealerships.some(d => d.email.toLowerCase() === data.dealershipEmail.toLowerCase())) {
      throw new Error('A dealership with this email already exists');
    }

    // Check if user email already exists
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('A user with this email already exists');
    }

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Create dealership
    const dealership: Dealership = {
      id: `dealership-${Date.now()}`,
      name: data.dealershipName,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      phone: data.phone,
      email: data.dealershipEmail,
      website: data.website,
      isActive: true,
      subscriptionPlan: 'basic',
      createdAt: new Date().toISOString(),
      settings: {
        allowUserRegistration: true,
        requireApproval: false,
        maxUsers: 10,
        features: {
          analytics: false,
          multiLocation: false,
          customReports: false,
          apiAccess: false
        }
      }
    };

    // Create admin user
    const user: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      initials: `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase(),
      role: 'admin',
      dealershipId: dealership.id,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Save to storage
    dealerships.push(dealership);
    users.push(user);
    localStorage.setItem(this.STORAGE_KEYS.DEALERSHIPS, JSON.stringify(dealerships));
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

    return { user, dealership };
  }

  static async registerUser(data: RegisterUserData, dealershipId: string): Promise<User> {
    const users = this.getUsers();
    const dealerships = this.getDealerships();

    const dealership = dealerships.find(d => d.id === dealershipId && d.isActive);
    if (!dealership) {
      throw new Error('Dealership not found');
    }

    // Check user limits
    const dealershipUsers = users.filter(u => u.dealershipId === dealershipId && u.isActive);
    if (dealershipUsers.length >= dealership.settings.maxUsers) {
      throw new Error('Maximum number of users reached for this dealership');
    }

    // Check if user email already exists
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('A user with this email already exists');
    }

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Create user
    const user: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      initials: `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase(),
      role: data.role,
      dealershipId: dealershipId,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

    return user;
  }

  static getDealerships(): Dealership[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.DEALERSHIPS);
    return data ? JSON.parse(data) : [];
  }

  static getUsers(): User[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  static getDealershipUsers(dealershipId: string): User[] {
    return this.getUsers().filter(u => u.dealershipId === dealershipId && u.isActive);
  }

  static updateUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  static updateDealership(dealership: Dealership): void {
    const dealerships = this.getDealerships();
    const index = dealerships.findIndex(d => d.id === dealership.id);
    if (index !== -1) {
      dealerships[index] = dealership;
      localStorage.setItem(this.STORAGE_KEYS.DEALERSHIPS, JSON.stringify(dealerships));
    }
  }

  static deactivateUser(userId: string): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isActive = false;
      this.updateUser(user);
    }
  }

  // Super Admin Methods
  static isSuperAdmin(user: User): boolean {
    return user.dealershipId === 'platform-admin';
  }

  static getAllDealershipsForSuperAdmin(): Dealership[] {
    return this.getDealerships().filter(d => d.id !== 'platform-admin');
  }

  static getAllUsersForSuperAdmin(): User[] {
    return this.getUsers().filter(u => u.dealershipId !== 'platform-admin');
  }

  // Vehicle data isolation per dealership
  static getDealershipVehicleStorageKey(dealershipId: string): string {
    return `${this.STORAGE_KEYS.VEHICLE_DATA_PREFIX}${dealershipId}`;
  }
}