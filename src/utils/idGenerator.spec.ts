import { idGeneratorFactory } from './idGenerator';
describe('id generator tests', () => {
  it('should create two different, independent id generators', () => {
    const gen1 = idGeneratorFactory();
    const gen2 = idGeneratorFactory();
    expect(gen1()).toEqual(0);
    expect(gen2()).toEqual(0);
    expect(gen1()).toEqual(1);
    expect(gen1()).toEqual(2);
    expect(gen2()).toEqual(1);
  });
});
