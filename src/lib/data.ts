import type { Hall } from '@/lib/types';

export const halls: Hall[] = [
  { id: 'esb1', name: 'ESB Seminar Hall - I', block: 'Engineering Sciences Block (ESB)', capacity: 100, image: 'https://placehold.co/600x400.png', dataAiHint: 'lecture hall' },
  { id: 'esb2', name: 'ESB Seminar Hall - II', block: 'Engineering Sciences Block (ESB)', capacity: 120, image: 'https://placehold.co/600x400.png', dataAiHint: 'conference room' },
  { id: 'esb3', name: 'ESB Seminar Hall - III', block: 'Engineering Sciences Block (ESB)', capacity: 80, image: 'https://placehold.co/600x400.png', dataAiHint: 'meeting space' },
  { id: 'des1', name: 'DES Seminar Hall - I', block: 'DES Block', capacity: 150, image: 'https://placehold.co/600x400.png', dataAiHint: 'auditorium interior' },
  { id: 'des2', name: 'DES Seminar Hall - II', block: 'DES Block', capacity: 70, image: 'https://placehold.co/600x400.png', dataAiHint: 'classroom setup' },
  { id: 'lhc1', name: 'LHC Seminar Hall - I', block: 'Lecture Hall Complex (LHC) Block', capacity: 200, image: 'https://placehold.co/600x400.png', dataAiHint: 'modern auditorium' },
  { id: 'lhc2', name: 'LHC Seminar Hall - II', block: 'Lecture Hall Complex (LHC) Block', capacity: 180, image: 'https://placehold.co/600x400.png', dataAiHint: 'presentation hall' },
  { id: 'apex', name: 'APEX Auditorium', block: 'APEX Block', capacity: 500, image: 'https://placehold.co/600x400.png', dataAiHint: 'large venue' },
];

export const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];
