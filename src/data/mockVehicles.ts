import { Vehicle } from '../types/vehicle';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    vin: '1HGCM82633A123456',
    year: 2023,
    make: 'Honda',
    model: 'Accord',
    trim: 'Sport',
    mileage: 15000,
    color: 'Pearl White',
    dateAcquired: '2024-01-15',
    targetSaleDate: '2024-02-15',
    price: 28500,
    location: 'Lot A-12',
    status: {
      emissions: 'completed',
      cosmetic: 'pending',
      mechanical: 'completed',
      cleaned: 'not-started',
      photos: 'needs-attention'
    },
    notes: 'Minor door ding on passenger side',
    teamNotes: [
      {
        id: '1',
        text: 'Vehicle received from trade-in. Initial inspection shows minor cosmetic issues.',
        userInitials: 'JD',
        timestamp: '2024-01-15T10:30:00Z',
        category: 'general'
      },
      {
        id: '2',
        text: 'Emissions testing completed successfully. All systems pass.',
        userInitials: 'MS',
        timestamp: '2024-01-16T14:20:00Z',
        category: 'emissions'
      },
      {
        id: '3',
        text: 'Door ding on passenger side needs PDR work before photos.',
        userInitials: 'TK',
        timestamp: '2024-01-17T09:15:00Z',
        category: 'cosmetic'
      }
    ]
  },
  {
    id: '2',
    vin: '1FTFW1ET5DFC12345',
    year: 2022,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    mileage: 25000,
    color: 'Magnetic Gray',
    dateAcquired: '2024-01-20',
    price: 45000,
    location: 'Lot B-03',
    status: {
      emissions: 'completed',
      cosmetic: 'completed',
      mechanical: 'completed',
      cleaned: 'completed',
      photos: 'completed'
    },
    notes: 'Excellent condition, ready for sale',
    teamNotes: [
      {
        id: '4',
        text: 'Excellent condition truck from lease return. Minimal reconditioning needed.',
        userInitials: 'JD',
        timestamp: '2024-01-20T11:00:00Z',
        category: 'general'
      },
      {
        id: '5',
        text: 'All mechanical systems check out perfectly. No issues found.',
        userInitials: 'RL',
        timestamp: '2024-01-21T13:45:00Z',
        category: 'mechanical'
      },
      {
        id: '6',
        text: 'Professional detail completed. Vehicle is showroom ready.',
        userInitials: 'AM',
        timestamp: '2024-01-22T16:30:00Z',
        category: 'cleaning'
      }
    ]
  },
  {
    id: '3',
    vin: '5YJ3E1EA4JF123456',
    year: 2021,
    make: 'Tesla',
    model: 'Model 3',
    trim: 'Standard Range Plus',
    mileage: 35000,
    color: 'Midnight Silver',
    dateAcquired: '2024-01-25',
    targetSaleDate: '2024-02-28',
    price: 38000,
    location: 'Indoor-05',
    status: {
      emissions: 'not-started',
      cosmetic: 'needs-attention',
      mechanical: 'pending',
      cleaned: 'not-started',
      photos: 'not-started'
    },
    notes: 'Charging port needs repair',
    teamNotes: [
      {
        id: '7',
        text: 'Tesla received with charging port issue. Needs service appointment.',
        userInitials: 'JD',
        timestamp: '2024-01-25T08:30:00Z',
        category: 'general'
      },
      {
        id: '8',
        text: 'Charging port door mechanism is stuck. Ordered replacement part.',
        userInitials: 'BW',
        timestamp: '2024-01-26T10:15:00Z',
        category: 'mechanical'
      }
    ]
  },
  {
    id: '4',
    vin: '1G1ZD5ST8JF123456',
    year: 2020,
    make: 'Chevrolet',
    model: 'Camaro',
    trim: 'SS',
    mileage: 42000,
    color: 'Rally Green',
    dateAcquired: '2024-01-10',
    price: 35000,
    location: 'Lot A-07',
    status: {
      emissions: 'completed',
      cosmetic: 'completed',
      mechanical: 'pending',
      cleaned: 'pending',
      photos: 'completed'
    },
    teamNotes: [
      {
        id: '9',
        text: 'Performance vehicle in good condition. Minor maintenance items to address.',
        userInitials: 'JD',
        timestamp: '2024-01-10T15:20:00Z',
        category: 'general'
      },
      {
        id: '10',
        text: 'Brake pads at 40% - recommend replacement before sale.',
        userInitials: 'RL',
        timestamp: '2024-01-12T11:30:00Z',
        category: 'mechanical'
      }
    ]
  },
  {
    id: '5',
    vin: '2T1BURHE8JC123456',
    year: 2019,
    make: 'Toyota',
    model: 'Corolla',
    trim: 'LE',
    mileage: 58000,
    color: 'Classic Silver',
    dateAcquired: '2024-01-30',
    price: 18500,
    location: 'Lot C-15',
    status: {
      emissions: 'pending',
      cosmetic: 'needs-attention',
      mechanical: 'needs-attention',
      cleaned: 'not-started',
      photos: 'not-started'
    },
    notes: 'Requires brake work and paint touch-up',
    teamNotes: [
      {
        id: '11',
        text: 'High mileage vehicle needs comprehensive inspection and reconditioning.',
        userInitials: 'JD',
        timestamp: '2024-01-30T12:00:00Z',
        category: 'general'
      },
      {
        id: '12',
        text: 'Front bumper has multiple scratches. Needs paint work.',
        userInitials: 'TK',
        timestamp: '2024-01-31T09:45:00Z',
        category: 'cosmetic'
      }
    ]
  }
];