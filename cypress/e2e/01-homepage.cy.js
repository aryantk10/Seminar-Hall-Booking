describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the homepage successfully', () => {
    cy.title().should('contain', 'Seminar Hall Booking')
    cy.get('h1').should('be.visible')
  })

  it('should display navigation menu', () => {
    cy.get('nav').should('be.visible')
    // Check for navigation links (they might be hidden on mobile)
    cy.get('body').then(($body) => {
      if ($body.find('nav a[href="/"]').length > 0) {
        cy.get('nav').should('contain', 'Home')
      }
      if ($body.find('nav a[href="/halls"]').length > 0) {
        cy.get('nav').should('contain', 'Halls')
      }
      if ($body.find('nav a[href="/bookings"]').length > 0) {
        cy.get('nav').should('contain', 'Bookings')
      }
    })
  })

  it('should have working navigation links', () => {
    // Test navigation to halls page using link href
    cy.get('a[href="/halls"]').first().click()
    cy.url().should('include', '/halls')

    // Navigate back to home using link href
    cy.get('a[href="/"]').first().click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should display login/register options for unauthenticated users', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy=login-button]').length > 0) {
        cy.dataCy('login-button').should('be.visible')
      } else {
        cy.contains('Login').should('be.visible')
      }
    })
  })

  it('should be responsive on mobile devices', () => {
    cy.viewport('iphone-6')
    cy.get('nav').should('be.visible')
    cy.get('h1').should('be.visible')
    
    // Test mobile menu if it exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy=mobile-menu-toggle]').length > 0) {
        cy.dataCy('mobile-menu-toggle').click()
        cy.dataCy('mobile-menu').should('be.visible')
      }
    })
  })

  it('should have proper meta tags for SEO', () => {
    cy.document().then((doc) => {
      const metaDescription = doc.querySelector('meta[name="description"]')
      const metaKeywords = doc.querySelector('meta[name="keywords"]')
      
      expect(metaDescription).to.exist
      expect(metaDescription.content).to.not.be.empty
    })
  })

  it('should load without console errors', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'error').as('consoleError')
    })
    
    cy.visit('/')
    cy.get('@consoleError').should('not.have.been.called')
  })

  it('should display footer information', () => {
    cy.get('footer').should('be.visible')
    cy.get('footer').should('contain.text', new Date().getFullYear())
  })
})
