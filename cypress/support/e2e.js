// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  if (err.message.includes('Event handlers cannot be passed to Client Component props')) {
    return false
  }
  if (err.message.includes('react-server-dom-webpack')) {
    return false
  }
  if (err.message.includes('Hydration failed')) {
    return false
  }
  return true
})

// Custom commands for API testing
Cypress.Commands.add('apiRequest', (method, url, body = null) => {
  return cy.request({
    method,
    url: `${Cypress.env('apiUrl')}${url}`,
    body,
    failOnStatusCode: false
  })
})

// Custom commands for authentication
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
  cy.url().should('not.include', '/login')
})

// Custom commands for hall booking
Cypress.Commands.add('createBooking', (hallId, date, timeSlot) => {
  cy.apiRequest('POST', '/api/bookings', {
    hallId,
    date,
    timeSlot,
    purpose: 'E2E Test Booking'
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201])
    return response.body
  })
})

// Custom commands for cleanup
Cypress.Commands.add('cleanupTestData', () => {
  // Clean up test bookings
  cy.apiRequest('DELETE', '/api/test/cleanup')
})
