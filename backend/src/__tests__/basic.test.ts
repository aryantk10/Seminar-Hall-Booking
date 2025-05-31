// Basic test file to ensure Jest works
describe('Backend Basic Tests', () => {
  it('should perform basic calculations', () => {
    expect(2 + 2).toBe(4);
    expect(10 * 5).toBe(50);
  });

  it('should handle string operations', () => {
    const appName = 'Seminar Hall Booking System';
    expect(appName).toContain('Hall');
    expect(appName.length).toBeGreaterThan(0);
  });

  it('should work with arrays', () => {
    const halls = ['Hall A', 'Hall B', 'Hall C'];
    expect(halls).toHaveLength(3);
    expect(halls).toContain('Hall A');
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });

  it('should validate environment variables', () => {
    // Test that we can access process.env
    expect(typeof process.env.NODE_ENV).toBe('string');
  });

  it('should handle JSON operations', () => {
    const booking = {
      id: '1',
      hallId: 'hall-1',
      status: 'pending',
      date: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(booking);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.id).toBe('1');
    expect(parsed.status).toBe('pending');
  });

  it('should validate date operations', () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    expect(tomorrow.getTime()).toBeGreaterThan(now.getTime());
  });
});
