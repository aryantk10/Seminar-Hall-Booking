export interface Hall {
  id: string;  // MongoDB _id
  frontendId: string;  // URL-friendly ID
  name: string;
  block: string;  // This maps to location in the backend
  capacity: number;  // Making this required since it's required in forms
  image?: string;
  dataAiHint?: string;
  amenities: string[];  // Making this required since we always provide a default empty array
  description?: string;  // Added to match form data
}

export interface Booking {
  id: string;
  hallId: string;
  hallName?: string;
  userId: string;
  userName?: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'faculty' | 'admin';
  department?: string;
  avatarDataUrl?: string; // Added for profile picture
  token?: string; // Added for authentication token
}
