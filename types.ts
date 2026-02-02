
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

  // Layout Settings
  layout?: LayoutConfig;

  // Individual Mode Data
  familyMembers: FamilyMember[];
}

export interface Template {
  id: string;
  title: string;
  content: string;
}

export interface LayoutConfig {
  imageX: number; // mm offset
  imageY: number; // mm offset
  imageScale: number; // % (50-200)
  imageObjectFit: 'cover' | 'contain';

  // Text Global Position
  textContainerX: number; // mm offset
  textContainerY: number; // mm offset

  // Message Settings
  message: {
    fontSize: number; // pt
    alignment: 'left' | 'center' | 'right';
    tracking: number; // em
    lineHeight: number;
    marginTop: number; // mm
  };

  // Name Settings
  name: {
    fontSize: number; // pt
    alignment: 'left' | 'center' | 'right';
    marginTop: number; // mm
    tracking: number; // em
  };

  paperSize: 'a4' | 'postcard';
}
