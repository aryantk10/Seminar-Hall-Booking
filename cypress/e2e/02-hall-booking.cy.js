describe('Hall Booking E2E Tests', () => {
  beforeEach(() => {
    // Clean up any existing test data
    cy.cleanupTestData()
    
    // Seed test data
    cy.seedTestData()
    
    // Visit the application
    cy.visit('/')
  })

  afterEach(() => {
    // Clean up test data after each test
    cy.cleanupTestData()
  })

  it('should display available halls', () => {
    cy.visitHalls()
    
    // Check if halls are displayed
    cy.get('[data-cy=hall-list]').should('be.visible')
    cy.get('[data-cy=hall-card]').should('have.length.at.least', 1)
    
    // Check hall information
    cy.get('[data-cy=hall-card]').first().within(() => {
      cy.get('[data-cy=hall-name]').should('be.visible')
      cy.get('[data-cy=hall-capacity]').should('be.visible')
      cy.get('[data-cy=hall-location]').should('be.visible')
    })
  })

  it('should allow users to view hall details', () => {
    cy.visitHalls()
    
    // Click on first hall
    cy.get('[data-cy=hall-card]').first().click()
    
    // Should navigate to hall details
    cy.url().should('include', '/halls/')
    
    // Check hall details page
    cy.get('[data-cy=hall-details]').should('be.visible')
    cy.get('[data-cy=hall-name]').should('be.visible')
    cy.get('[data-cy=hall-description]').should('be.visible')
    cy.get('[data-cy=book-hall-button]').should('be.visible')
  })

  it('should require authentication for booking', () => {
    cy.visitHalls()
    
    // Try to book without login
    cy.get('[data-cy=hall-card]').first().click()
    cy.get('[data-cy=book-hall-button]').click()
    
    // Should redirect to login or show login modal
    cy.url().should('satisfy', (url) => {
      return url.includes('/login') || url.includes('/auth')
    })
  })

  it('should allow authenticated users to make bookings', () => {
    // Login first
    cy.loginAsUser()
    
    // Navigate to halls
    cy.visitHalls()
    
    // Select a hall
    cy.get('[data-cy=hall-card]').first().click()
    cy.get('[data-cy=book-hall-button]').click()
    
    // Fill booking form
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    
    cy.fillBookingForm('Test Hall A', dateString, '09:00-10:00', 'E2E Test Meeting')
    
    // Submit booking
    cy.get('[data-cy=submit-booking]').click()
    
    // Check success message
    cy.get('[data-cy=success-message]').should('be.visible')
    cy.get('[data-cy=success-message]').should('contain', 'Booking created successfully')
  })

  it('should display user bookings', () => {
    // Login and create a booking first
    cy.loginAsUser()
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    
    cy.createBooking('test-hall-a', dateString, '09:00-10:00')
    
    // Visit bookings page
    cy.visitBookings()
    
    // Check if booking is displayed
    cy.get('[data-cy=booking-list]').should('be.visible')
    cy.get('[data-cy=booking-item]').should('have.length.at.least', 1)
    
    // Check booking details
    cy.get('[data-cy=booking-item]').first().within(() => {
      cy.get('[data-cy=booking-hall]').should('contain', 'Test Hall A')
      cy.get('[data-cy=booking-date]').should('contain', dateString)
      cy.get('[data-cy=booking-status]').should('be.visible')
    })
  })

  it('should allow users to cancel bookings', () => {
    // Login and create a booking first
    cy.loginAsUser()
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    
    cy.createBooking('test-hall-a', dateString, '09:00-10:00')
    
    // Visit bookings page
    cy.visitBookings()
    
    // Cancel the booking
    cy.get('[data-cy=booking-item]').first().within(() => {
      cy.get('[data-cy=cancel-booking]').click()
    })
    
    // Confirm cancellation
    cy.get('[data-cy=confirm-cancel]').click()
    
    // Check success message
    cy.get('[data-cy=success-message]').should('contain', 'Booking cancelled')
  })

  it('should prevent double booking of the same time slot', () => {
    // Login
    cy.loginAsUser()
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    
    // Create first booking
    cy.createBooking('test-hall-a', dateString, '09:00-10:00')
    
    // Try to create second booking for same slot
    cy.visitHalls()
    cy.get('[data-cy=hall-card]').first().click()
    cy.get('[data-cy=book-hall-button]').click()
    
    cy.fillBookingForm('Test Hall A', dateString, '09:00-10:00', 'Conflicting Meeting')
    cy.get('[data-cy=submit-booking]').click()
    
    // Should show error message
    cy.get('[data-cy=error-message]').should('be.visible')
    cy.get('[data-cy=error-message]').should('contain', 'time slot is already booked')
  })

  it('should display booking calendar view', () => {
    cy.visitHalls()
    
    // Navigate to calendar view
    cy.get('[data-cy=calendar-view]').click()
    
    // Check calendar is displayed
    cy.get('[data-cy=booking-calendar]').should('be.visible')
    cy.get('[data-cy=calendar-month]').should('be.visible')
    cy.get('[data-cy=calendar-days]').should('be.visible')
  })
})
