import type { Hall } from '@/lib/types';

export const halls: Hall[] = [
  // Auditoriums - Official Institute Facilities
  { id: 'apex-auditorium', name: 'Apex Block Auditorium', block: 'APEX Block', capacity: 1000, image: '/images/halls/apex-auditorium.jpg', dataAiHint: 'large auditorium', amenities: ['Large LED Screen', 'Professional Sound System', 'Stage Lighting', 'Green Room', 'Wi-Fi', 'Air Conditioning', 'Parking'] },
  { id: 'esb-hall-1', name: 'ESB Seminar Hall 1', block: 'Engineering Sciences Block (ESB)', capacity: 315, image: '/images/halls/esb-seminar-hall-1.jpg', dataAiHint: 'seminar hall', amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Podium'] },
  { id: 'esb-hall-2', name: 'ESB Seminar Hall 2', block: 'Engineering Sciences Block (ESB)', capacity: 140, image: '/images/halls/esb-seminar-hall-2.jpg', dataAiHint: 'seminar hall', amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'] },
  { id: 'des-hitech', name: 'DES Hi-Tech Seminar Hall', block: 'Department of Engineering Sciences (DES)', capacity: 200, image: '/images/halls/des-hitech-seminar-hall.jpg', dataAiHint: 'hi-tech seminar hall', amenities: ['Advanced Projector', 'Interactive Whiteboard', 'Sound System', 'Wi-Fi', 'Video Conferencing'] },
  { id: 'lhc-hall-1', name: 'LHC Seminar Hall 1', block: 'Lecture Hall Complex (LHC)', capacity: 115, image: '/images/halls/lhc-seminar-hall-1.jpg', dataAiHint: 'lecture hall', amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'] },
  { id: 'lhc-hall-2', name: 'LHC Seminar Hall 2', block: 'Lecture Hall Complex (LHC)', capacity: 115, image: '/images/halls/lhc-seminar-hall-2.jpg', dataAiHint: 'lecture hall', amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'] },

  // Board Rooms - Official Institute Facilities
  { id: 'apex-board', name: 'Apex Board Room', block: 'APEX Block', capacity: 60, image: '/images/halls/apex-board-room.jpg', dataAiHint: 'board room', amenities: ['Conference Table', 'Video Conferencing', 'Projector', 'Wi-Fi', 'Air Conditioning'] },
  { id: 'esb-board', name: 'ESB Board Room', block: 'Engineering Sciences Block (ESB)', capacity: 60, image: '/images/halls/esb-board-room.jpg', dataAiHint: 'board room', amenities: ['Conference Table', 'Video Conferencing', 'Projector', 'Wi-Fi'] },
  { id: 'des-board-1', name: 'DES Board Room 1', block: 'Department of Engineering Sciences (DES)', capacity: 50, image: '/images/halls/des-board-room-1.jpg', dataAiHint: 'board room', amenities: ['Conference Table', 'Projector', 'Wi-Fi', 'Air Conditioning'] },
  { id: 'des-board-2', name: 'DES Board Room 2', block: 'Department of Engineering Sciences (DES)', capacity: 45, image: '/images/halls/des-board-room-2.jpg', dataAiHint: 'board room', amenities: ['Conference Table', 'Projector', 'Wi-Fi'] },
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
