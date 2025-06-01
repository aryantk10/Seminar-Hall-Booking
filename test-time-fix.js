// Test the time conversion fix
function extractTimeFromDate(dateInput) {
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

function extractLocalTimeFromDate(dateInput) {
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

// Test with your actual MongoDB data
const startTime = "2025-06-01T14:00:00.000+00:00";
const endTime = "2025-06-01T15:30:00.000+00:00";

console.log('🧪 Testing Time Conversion Fix\n');

console.log('📅 MongoDB Data:');
console.log('startTime:', startTime);
console.log('endTime:', endTime);

console.log('\n⏰ UTC Time Extraction (NEW - FIXED):');
console.log('startTime:', extractTimeFromDate(startTime));
console.log('endTime:', extractTimeFromDate(endTime));

console.log('\n🌍 Local Time Extraction (OLD - WRONG):');
console.log('startTime:', extractLocalTimeFromDate(startTime));
console.log('endTime:', extractLocalTimeFromDate(endTime));

console.log('\n✅ Expected Result: 14:00 - 15:30');
console.log('❌ Wrong Result: 19:30 - 21:00 (what you were seeing)');

// Test with current date object
const testDate = new Date(startTime);
console.log('\n🔍 Date Object Analysis:');
console.log('Original string:', startTime);
console.log('Date object:', testDate);
console.log('getUTCHours():', testDate.getUTCHours());
console.log('getHours():', testDate.getHours());
console.log('Timezone offset (minutes):', testDate.getTimezoneOffset());
