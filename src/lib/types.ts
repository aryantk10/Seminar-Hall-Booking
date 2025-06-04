export interface Hall {
  id: string;  // MongoDB _id
  frontendId: string;  // URL-friendly ID
  name: string;
  block: string;
  capacity?: number;
  image?: string;
  dataAiHint?: string;
  amenities?: string[]; // Added
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
