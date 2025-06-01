/**
 * Utility functions for handling time conversion between backend and frontend
 */

/**
 * Extract time from a date string/object, accounting for timezone issues
 * The backend stores times with timezone info, so we need to extract just the time part
 * without additional timezone conversion
 */
export function extractTimeFromDate(dateInput: string | Date): string {
  try {
    const date = new Date(dateInput);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date provided to extractTimeFromDate:', dateInput);
      return '00:00';
    }

    // Extract hours and minutes directly from the date object
    // Use getUTCHours and getUTCMinutes to avoid local timezone conversion
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    
    // Format as HH:MM
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error extracting time from date:', error);
    return '00:00';
  }
}

/**
 * Extract time from a date string/object using local timezone
 * Use this when you want the time in the user's local timezone
 */
export function extractLocalTimeFromDate(dateInput: string | Date): string {
  try {
    const date = new Date(dateInput);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date provided to extractLocalTimeFromDate:', dateInput);
      return '00:00';
    }

    // Use local time methods
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Format as HH:MM
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error extracting local time from date:', error);
    return '00:00';
  }
}

/**
 * Check if the backend time needs timezone adjustment
 * This function helps determine which extraction method to use
 */
export function shouldUseUTCTime(dateInput: string | Date): boolean {
  try {
    const utcTime = extractTimeFromDate(dateInput);
    const localTime = extractLocalTimeFromDate(dateInput);

    // If there's a significant difference, the backend likely stored UTC
    const utcMinutes = parseInt(utcTime.split(':')[0]) * 60 + parseInt(utcTime.split(':')[1]);
    const localMinutes = parseInt(localTime.split(':')[0]) * 60 + parseInt(localTime.split(':')[1]);

    // If the difference is more than 2 hours, likely a timezone issue
    return Math.abs(utcMinutes - localMinutes) > 120;
  } catch (error) {
    console.error('Error checking timezone:', error);
    return false;
  }
}

/**
 * Smart time extraction that automatically chooses the best method
 * This is the recommended function to use for displaying booking times
 */
export function getBookingTime(dateInput: string | Date): string {
  // Use UTC time extraction since backend stores times in UTC
  // This preserves the original time the user selected (e.g., 14:00 stays 14:00)
  return extractTimeFromDate(dateInput);
}

/**
 * Format time for display with optional 12-hour format
 */
export function formatTimeForDisplay(timeString: string, use12Hour: boolean = false): string {
  if (!timeString || !timeString.includes(':')) {
    return timeString;
  }

  if (!use12Hour) {
    return timeString; // Return as-is for 24-hour format
  }

  // Convert to 12-hour format
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
