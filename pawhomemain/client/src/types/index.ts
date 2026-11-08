export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  _count?: {
    pets: number;
    appointments: number;
    reminders: number;
    favorites: number;
  };
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  animalType: 'Dog' | 'Cat' | 'Other' | string;
  breed: string;
  age?: number | null;
  gender: 'Male' | 'Female' | string;
  dateOfBirth?: string | null;
  weight?: number | null;
  imageUrl?: string | null;
  medicalInfo?: string | null;
  vaccinationDetails?: string | null;
  allergies?: string | null;
  specialNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    healthRecords: number;
    moodAnalyses: number;
    appointments: number;
  };
}

export interface PetHealthRecord {
  id: string;
  petId: string;
  recordType: 'Vaccination' | 'Deworming' | 'Medical History' | 'Weight Tracking' | 'Surgery' | 'General Checkup' | string;
  title: string;
  date: string;
  description?: string | null;
  clinicOrVet?: string | null;
  nextDueDate?: string | null;
  attachmentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  pet?: Pet;
}

export interface MoodAnalysis {
  id: string;
  petId: string;
  petName?: string;
  imageUrl: string;
  predictedMood: 'Happy' | 'Relaxed' | 'Curious' | 'Playful' | 'Fearful' | 'Stressed';
  confidence: number;
  explanation: string;
  observations: string[];
  careTips: string[];
  isDemoMode: boolean;
  disclaimer?: string;
  createdAt: string;
  pet?: Pet;
}

export interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  animalType: 'Dog' | 'Cat' | 'Both' | string;
  ageCategory: 'Puppy' | 'Kitten' | 'Adult' | 'Senior' | 'All Stages' | string;
  foodType: 'Dry Food' | 'Wet Food' | 'Treats' | 'Special Dietary Food' | string;
  description: string;
  keyIngredients: string;
  nutritionalInfo: string;
  allergyWarnings?: string | null;
  feedingGuidance: string;
  price: number;
  rating: number;
  isDemo: boolean;
  isFavorite?: boolean;
}

export interface VeterinaryDoctor {
  id: string;
  name: string;
  clinicName: string;
  imageUrl: string;
  specialization: string;
  clinicAddress: string;
  phone: string;
  email?: string | null;
  experienceYears: number;
  consultationFee: number;
  availableDays: string;
  availableTimeSlots: string[];
  rating: number;
  isDemo: boolean;
}

export interface Salon {
  id: string;
  name: string;
  imageUrl: string;
  address: string;
  phone: string;
  rating: number;
  availableDays: string;
  availableTimeSlots: string[];
  isDemo: boolean;
  services: SalonService[];
}

export interface SalonService {
  id: string;
  salonId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export interface Appointment {
  id: string;
  userId: string;
  petId: string;
  type: 'VETERINARY' | 'SALON';
  vetId?: string | null;
  salonId?: string | null;
  serviceId?: string | null;
  date: string;
  timeSlot: string;
  reason?: string | null;
  notes?: string | null;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  fee?: number | null;
  createdAt: string;
  updatedAt: string;
  pet: Pet;
  vet?: VeterinaryDoctor | null;
  salon?: Salon | null;
  service?: SalonService | null;
}

export interface Reminder {
  id: string;
  userId: string;
  petId: string;
  title: string;
  category: 'Vaccination' | 'Medication' | 'Grooming' | 'Checkup' | 'Diet' | 'Other' | string;
  dueDate: string;
  isCompleted: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  pet?: {
    id: string;
    name: string;
    animalType: string;
    imageUrl?: string | null;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}
