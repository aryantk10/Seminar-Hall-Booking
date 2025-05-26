import type { Hall } from '@/lib/types';

export const halls: Hall[] = [
  { id: 'esb1', name: 'ESB Seminar Hall - I', block: 'Engineering Sciences Block (ESB)', capacity: 100, image: 'https://placehold.co/600x400.png', dataAiHint: 'lecture hall', amenities: ['Projector', 'Whiteboard', 'Wi-Fi', 'Air Conditioning'] },
  { id: 'esb2', name: 'ESB Seminar Hall - II', block: 'Engineering Sciences Block (ESB)', capacity: 120, image: 'https://placehold.co/600x400.png', dataAiHint: 'conference room', amenities: ['Projector', 'Sound System', 'Podium', 'Wi-Fi', 'Microphone'] },
  { id: 'esb3', name: 'ESB Seminar Hall - III', block: 'Engineering Sciences Block (ESB)', capacity: 80, image: 'https://placehold.co/600x400.png', dataAiHint: 'meeting space', amenities: ['Projector', 'Wi-Fi', 'Video Conferencing'] },
  { id: 'des1', name: 'DES Seminar Hall - I', block: 'DES Block', capacity: 150, image: 'https://placehold.co/600x400.png', dataAiHint: 'auditorium interior', amenities: ['Projector', 'Large Screen', 'Sound System', 'Stage', 'Wi-Fi', 'Air Conditioning'] },
  { id: 'des2', name: 'DES Seminar Hall - II', block: 'DES Block', capacity: 70, image: 'https://placehold.co/600x400.png', dataAiHint: 'classroom setup', amenities: ['Projector', 'Whiteboard', 'Wi-Fi'] },
  { id: 'lhc1', name: 'LHC Seminar Hall - I', block: 'Lecture Hall Complex (LHC) Block', capacity: 200, image: 'https://placehold.co/600x400.png', dataAiHint: 'modern auditorium', amenities: ['Dual Projectors', 'Advanced Sound System', 'Video Conferencing', 'Tiered Seating', 'Wi-Fi', 'Air Conditioning'] },
  { id: 'lhc2', name: 'LHC Seminar Hall - II', block: 'Lecture Hall Complex (LHC) Block', capacity: 180, image: 'https://placehold.co/600x400.png', dataAiHint: 'presentation hall', amenities: ['Projector', 'Sound System', 'Interactive Whiteboard', 'Wi-Fi'] },
  { id: 'apex', name: 'APEX Auditorium', block: 'APEX Block', capacity: 500, image: 'https://placehold.co/600x400.png', dataAiHint: 'large venue', amenities: ['Large LED Screen', 'Professional Sound System', 'Stage Lighting', 'Green Room', 'Wi-Fi', 'Air Conditioning', 'Parking'] },
];

export const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];
