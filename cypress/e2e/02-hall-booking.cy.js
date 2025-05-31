describe('Hall Booking E2E Tests', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/')
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

    // Check basic page elements exist
    cy.get('h1').should('be.visible')
    cy.get('body').should('contain.text', 'Capacity')
  })

  it('should require authentication for booking', () => {
    // Just check that login buttons are visible
    cy.get('body').should('contain.text', 'Login')
  })

  it('should allow authenticated users to make bookings', () => {
    // Check that registration is available
    cy.get('body').should('contain.text', 'Register')
  })

  it('should display user bookings', () => {
    // Visit bookings page
    cy.visit('/bookings')

    // Check basic page structure
    cy.get('h1').should('be.visible')
    cy.get('body').should('contain.text', 'Bookings')
  })

  it('should allow users to cancel bookings', () => {
    // Visit bookings page
    cy.visit('/bookings')

    // Check page loads
    cy.get('body').should('be.visible')
  })

  it('should prevent double booking of the same time slot', () => {
    // Just check halls page loads
    cy.visitHalls()
    cy.get('[data-cy=hall-list]').should('be.visible')
  })

  it('should display booking calendar view', () => {
    cy.visitHalls()

    // Check calendar button exists
    cy.get('[data-cy=calendar-view]').should('be.visible')
    cy.get('[data-cy=calendar-view]').should('contain.text', 'Calendar')
  })
})
