// Basic test to ensure testing infrastructure works
// Simplified version without React Testing Library for now

describe('Basic Tests', () => {
  it('should perform basic calculations', () => {
    expect(2 + 2).toBe(4)
    expect(10 * 5).toBe(50)
  })

  it('should handle string operations', () => {
    const str = 'Seminar Hall Booking'
    expect(str).toContain('Hall')
    expect(str.length).toBeGreaterThan(0)
  })

  it('should work with arrays', () => {
    const halls = ['Hall A', 'Hall B', 'Hall C']
    expect(halls).toHaveLength(3)
    expect(halls).toContain('Hall A')
  })

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success')
    const result = await promise
    expect(result).toBe('success')
  })

  it('should validate basic types', () => {
    const booking = {
      id: '1',
      hallId: 'hall-1',
      status: 'pending'
    }
    expect(typeof booking.id).toBe('string')
    expect(booking.status).toBe('pending')
  })
})
