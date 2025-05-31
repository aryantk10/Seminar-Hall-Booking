// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`)
})

// -- This is a child command --
Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => {
  // ... previous subject is automatically received
  // and passed as the first argument
})

// -- This is a dual command --
Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => {
  // ... conditionally wraps or yields the subject
})

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
//   // ... add custom logic here
// })

// Authentication commands
Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@example.com', 'adminpassword123')
})

Cypress.Commands.add('loginAsUser', () => {
  cy.login(Cypress.env('testUser').email, Cypress.env('testUser').password)
})

// Navigation commands
Cypress.Commands.add('visitDashboard', () => {
  cy.visit('/dashboard')
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('visitHalls', () => {
  cy.visit('/halls')
  cy.url().should('include', '/halls')
})

Cypress.Commands.add('visitBookings', () => {
  cy.visit('/bookings')
  cy.url().should('include', '/bookings')
})

// Form interaction commands
Cypress.Commands.add('fillBookingForm', (hallName, date, timeSlot, purpose) => {
  cy.dataCy('hall-select').select(hallName)
  cy.dataCy('date-input').type(date)
  cy.dataCy('time-slot-select').select(timeSlot)
  cy.dataCy('purpose-input').type(purpose)
})

Cypress.Commands.add('submitForm', (formSelector = 'form') => {
  cy.get(formSelector).submit()
})

// Wait commands
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-cy=page-loader]', { timeout: 10000 }).should('not.exist')
})

Cypress.Commands.add('waitForApiCall', (alias) => {
  cy.wait(alias).its('response.statusCode').should('be.oneOf', [200, 201, 204])
})

// Assertion commands
Cypress.Commands.add('shouldBeVisible', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible')
})

Cypress.Commands.add('shouldContainText', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should('contain.text', text)
})

// Database commands (for testing)
Cypress.Commands.add('seedTestData', () => {
  cy.apiRequest('POST', '/api/test/seed', {
    halls: [
      { name: 'Test Hall A', capacity: 50, location: 'Building 1' },
      { name: 'Test Hall B', capacity: 100, location: 'Building 2' }
    ],
    users: [
      { email: 'testuser@example.com', name: 'Test User', role: 'user' }
    ]
  })
})

// Screenshot commands
Cypress.Commands.add('takeScreenshot', (name) => {
  cy.screenshot(name, { capture: 'viewport' })
})

// Local storage commands
Cypress.Commands.add('saveLocalStorage', () => {
  Object.keys(localStorage).forEach(key => {
    cy.window().then((win) => {
      win.localStorage.setItem(key, localStorage.getItem(key))
    })
  })
})

Cypress.Commands.add('restoreLocalStorage', () => {
  cy.window().then((win) => {
    Object.keys(localStorage).forEach(key => {
      win.localStorage.setItem(key, localStorage.getItem(key))
    })
  })
})
