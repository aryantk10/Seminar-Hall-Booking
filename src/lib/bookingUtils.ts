
'use server';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';

/**
 * Checks if two time intervals overlap.
 * @param start1 Start time of the first interval (e.g., "09:00")
 * @param end1 End time of the first interval (e.g., "10:00")
 * @param start2 Start time of the second interval (e.g., "09:30")
 * @param end2 End time of the second interval (e.g., "10:30")
 * @returns True if the intervals overlap, false otherwise.
 */
export const doesOverlap = (
  start1: string, end1: string,
  start2: string, end2: string
): boolean => {
  const s1 = parseInt(start1.replace(":", ""), 10);
  const e1 = parseInt(end1.replace(":", ""), 10);
  const s2 = parseInt(start2.replace(":", ""), 10);
  const e2 = parseInt(end2.replace(":", ""), 10);
  return Math.max(s1, s2) < Math.min(e1, e2);
};

/**
 * Checks if two bookings conflict based on hall, date, and time.
 * @param bookingA A booking object or relevant parts.
 * @param bookingB Another booking object or relevant parts.
 * @returns True if the bookings conflict, false otherwise.
 */
export const isBookingConflict = (
  bookingA: Pick<Booking, 'hallId' | 'date' | 'startTime' | 'endTime'>,
  bookingB: Pick<Booking, 'hallId' | 'date' | 'startTime' | 'endTime'>
): boolean => {
  if (bookingA.hallId !== bookingB.hallId) return false;
  // Ensure dates are compared correctly, even if one is a Date object and other is string from storage initially
  if (format(new Date(bookingA.date), "yyyy-MM-dd") !== format(new Date(bookingB.date), "yyyy-MM-dd")) return false;
  
  return doesOverlap(bookingA.startTime, bookingA.endTime, bookingB.startTime, bookingB.endTime);
};

/**
 * Checks if a specific pending booking conflicts with any *approved* booking in a list.
 * @param pendingBooking The pending booking to check.
 * @param allBookings A list of all bookings.
 * @returns True if the pending booking conflicts with an approved one, false otherwise.
 */
export const checkPendingConflictWithApproved = (
  pendingBooking: Booking,
  allBookings: Booking[]
): boolean => {
  if (pendingBooking.status !== 'pending') return false;

  const approvedBookingsForSameHallAndDate = allBookings.filter(
    (b) =>
      b.id !== pendingBooking.id &&
      b.status === 'approved' &&
      b.hallId === pendingBooking.hallId &&
      format(new Date(b.date), 'yyyy-MM-dd') === format(new Date(pendingBooking.date), 'yyyy-MM-dd')
  );

  for (const approvedBooking of approvedBookingsForSameHallAndDate) {
    if (isBookingConflict(pendingBooking, approvedBooking)) {
      return true; // Found a conflict
    }
  }
  return false; // No conflict
};
