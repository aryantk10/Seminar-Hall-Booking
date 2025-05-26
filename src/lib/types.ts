
export interface Hall {
  id: string;
  name: string;
  block: string;
  capacity?: number;
  image?: string;
  dataAiHint?: string;
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
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'faculty' | 'admin';
}
