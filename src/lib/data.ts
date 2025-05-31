import type { Hall } from '@/lib/types';

export const halls: Hall[] = [
  // Auditorium
  { id: 'apex-auditorium', name: 'APEX Auditorium', block: 'APEX Block', capacity: 1000, image: '/images/halls/apex-auditorium.jpg', dataAiHint: 'large auditorium', amenities: ['Large LED Screen', 'Professional Sound System', 'Stage Lighting', 'Green Room', 'Wi-Fi', 'Air Conditioning', 'Parking'] },

  // ESB Seminar Halls
  { id: 'esb-hall-1', name: 'ESB Seminar Hall - I', block: 'Engineering Sciences Block (ESB)', capacity: 315, image: '/images/halls/esb-seminar-hall-1.jpg', dataAiHint: 'seminar hall', amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Podium'] },
  { id: 'esb-hall-2', name: 'ESB Seminar Hall - II', block: 'Engineering Sciences Block (ESB)', capacity: 140, image: '/images/halls/esb-seminar-hall-2.jpg', dataAiHint: 'seminar hall', amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'] },
  { id: 'esb-hall-3', name: 'ESB Seminar Hall - III', block: 'Engineering Sciences Block (ESB)', capacity: 200, image: '/images/halls/esb-seminar-hall-3.jpg', dataAiHint: 'seminar hall', amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'] },

  // DES Seminar Halls
  { id: 'des-hall-1', name: 'DES Seminar Hall - I', block: 'Department of Engineering Sciences (DES)', capacity: 200, image: '/images/halls/des-seminar-hall-1.jpg', dataAiHint: 'seminar hall', amenities: ['Advanced Projector', 'Interactive Whiteboard', 'Sound System', 'Wi-Fi', 'Video Conferencing'] },
  { id: 'des-hall-2', name: 'DES Seminar Hall - II', block: 'Department of Engineering Sciences (DES)', capacity: 150, image: '/images/halls/des-seminar-hall-2.jpg', dataAiHint: 'seminar hall', amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'] },

  // LHC Seminar Halls
  { id: 'lhc-hall-1', name: 'LHC Seminar Hall - I', block: 'Lecture Hall Complex (LHC)', capacity: 115, image: '/images/halls/lhc-seminar-hall-1.jpg', dataAiHint: 'lecture hall', amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'] },
  { id: 'lhc-hall-2', name: 'LHC Seminar Hall - II', block: 'Lecture Hall Complex (LHC)', capacity: 115, image: '/images/halls/lhc-seminar-hall-2.jpg', dataAiHint: 'lecture hall', amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'] },
];

export const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

export const allPossibleAmenities: string[] = [
  'Projector',
  'Advanced Projector',
  'Dual Projectors',
  'Whiteboard',
  'Interactive Whiteboard',
  'Wi-Fi',
  'Air Conditioning',
  'Sound System',
  'Advanced Sound System',
  'Professional Sound System',
  'Microphone',
  'Podium',
  'Video Conferencing',
  'Large Screen',
  'Large LED Screen',
  'Stage',
  'Stage Lighting',
  'Tiered Seating',
  'Green Room',
  'Parking',
  'Conference Table',
  'Refreshments Area',
  'Wheelchair Accessible',
];
