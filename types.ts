
export interface AddressData {
  zip: string;
  prefecture: string;
  city: string;
  addressLine: string; // Rest of the address
}

export interface FamilyMember {
  id: string;
  originalImage: string | null;
  processedImage: string | null;
  profile: string; // e.g. "趣味：サッカー"
}

export type IllustrationStyle = 'standard' | 'casual' | 'simple' | 'luxury';

export interface FormData {
  name: string;
  familySize: number;
  familyType: 'single' | 'couple' | 'family_small' | 'family_school' | 'two_households' | null;
  oldAddress: AddressData;
  newAddress: AddressData;
  hobbies: string;
  selectedTemplateId: string;
  customMessage: string;

  // Schedule
  // Schedule
  visitMonth: string;
  visitDay: string;
  visitTime: string;

  // Photo Settings
  photoMode: 'group' | 'individual';
  illustrationStyle: IllustrationStyle;
  objectFit: 'cover' | 'contain'; // Added to control image cropping

  // Appearance
  backgroundColor: string;
  paperSize: 'a4' | 'postcard';

  // Group Mode Data
  originalImage: string | null; // Base64
  processedImage: string | null; // Base64

  // Individual Mode Data
  familyMembers: FamilyMember[];
}

export interface Template {
  id: string;
  title: string;
  content: string;
}

export interface LayoutConfig {
  imageScale: number;
  imageX: number;
  imageY: number;
  textX: number;
  textY: number;
  objectFit: 'cover' | 'contain';
  fontSize: number; // percentage, default 100
  paperSize: 'a4' | 'postcard' | 'b5';
}
