import { logger } from './logging';
// @ts-ignore
global.console = {
  log: jest.fn(),
};

describe('logger tests', () => {
  it('should not log anything', () => {
    logger.log('hi');
    expect(global.console.log).toHaveBeenCalledTimes(0);
  });
  it('should log "hello world"', () => {
    logger.enableLogging();
    logger.log('hello world');
    expect(global.console.log).toHaveBeenCalledWith('hello world');
  });
});
