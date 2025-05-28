const API_URL = 'http://localhost:5000/api';
let adminToken = '';
let facultyToken = '';

async function testAPIs() {
    try {
        console.log('Testing Authentication APIs...');
        
        // Register Admin
        const adminRegister = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Admin',
                email: 'admin@test.com',
                password: 'password123',
                role: 'admin'
            })
        });
        console.log('Admin Registration:', adminRegister.status, await adminRegister.json());

        // Register Faculty
        const facultyRegister = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Faculty',
                email: 'faculty@test.com',
                password: 'password123',
                role: 'faculty'
            })
        });
        console.log('Faculty Registration:', facultyRegister.status, await facultyRegister.json());

        // Login Admin
        const adminLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'password123'
            })
        });
        const adminData = await adminLogin.json();
        adminToken = adminData.token;
        console.log('Admin Login:', adminLogin.status, adminData);

        // Login Faculty
        const facultyLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'faculty@test.com',
                password: 'password123'
            })
        });
        const facultyData = await facultyLogin.json();
        facultyToken = facultyData.token;
        console.log('Faculty Login:', facultyLogin.status, facultyData);

        console.log('\nTesting Hall APIs...');
        
        // Create Hall (Admin only)
        const createHall = await fetch(`${API_URL}/halls`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: 'Test Hall',
                capacity: 100,
                location: 'Main Building',
                facilities: ['Projector', 'AC'],
                description: 'A test hall',
                isAvailable: true
            })
        });
        const hallData = await createHall.json();
        console.log('Create Hall:', createHall.status, hallData);

        // Get All Halls
        const getHalls = await fetch(`${API_URL}/halls`, {
            headers: { 'Authorization': `Bearer ${facultyToken}` }
        });
        console.log('Get Halls:', getHalls.status, await getHalls.json());

        console.log('\nTesting Booking APIs...');
        
        // Create Booking (Faculty)
        const createBooking = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${facultyToken}`
            },
            body: JSON.stringify({
                hall: hallData._id,
                startTime: new Date(Date.now() + 86400000), // Tomorrow
                endTime: new Date(Date.now() + 90000000),   // Tomorrow + 1 hour
                purpose: 'Test Booking',
                attendees: 50
            })
        });
        const bookingData = await createBooking.json();
        console.log('Create Booking:', createBooking.status, bookingData);

        // Get All Bookings (Admin)
        const getBookings = await fetch(`${API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log('Get Bookings:', getBookings.status, await getBookings.json());

        // Get My Bookings (Faculty)
        const getMyBookings = await fetch(`${API_URL}/bookings/my-bookings`, {
            headers: { 'Authorization': `Bearer ${facultyToken}` }
        });
        console.log('Get My Bookings:', getMyBookings.status, await getMyBookings.json());

        // Approve Booking (Admin)
        const approveBooking = await fetch(`${API_URL}/bookings/${bookingData._id}/approve`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log('Approve Booking:', approveBooking.status, await approveBooking.json());

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPIs(); 