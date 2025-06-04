import type { Hall } from './types';

export interface BackendHall {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  facilities: string[];
  description?: string;
  images?: string[];
  isAvailable: boolean;
  frontendId: string;
}

/**
 * Transforms a backend hall object to frontend Hall type
 */
export function transformBackendHall(backendHall: BackendHall): Hall {
  console.log('🔄 Transforming hall:', {
    _id: backendHall._id,
    frontendId: backendHall.frontendId,
    name: backendHall.name
  });
  
  const transformedHall: Hall = {
    id: backendHall._id,
    frontendId: backendHall.frontendId,
    name: backendHall.name,
    block: backendHall.location,
    capacity: backendHall.capacity,
    amenities: backendHall.facilities || [],
    image: backendHall.images?.[0],
    dataAiHint: backendHall.capacity > 500 ? 'large auditorium' : 'seminar hall',
    description: backendHall.description
  };
  
  console.log('✨ Transformed result:', transformedHall);
  return transformedHall;
}

/**
 * Syncs hall data with localStorage
 */
export function syncHallsToLocalStorage(halls: Hall[]): void {
  localStorage.setItem('hallHubConfiguredHalls', JSON.stringify(halls));
}

/**
 * Gets halls from localStorage
 */
export function getHallsFromLocalStorage(): Hall[] {
  const stored = localStorage.getItem('hallHubConfiguredHalls');
  return stored ? JSON.parse(stored) : [];
}
