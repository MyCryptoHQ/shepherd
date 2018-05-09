import * as utils from './ethDataTypes';

describe('isHexString', () => {
  it('should pass', () => {
    expect(utils.isHexString('0x').ok()).toEqual(true);
  });
  it('should pass', () => {
    expect(utils.isHexString('0x0').ok()).toEqual(true);
  });
  it('should pass', () => {
    expect(utils.isHexString('0').ok()).toEqual(true);
  });
  it('should pass', () => {
    expect(utils.isHexString('0xabcdef1234567890').ok()).toEqual(true);
  });
  it('should pass', () => {
    expect(utils.isHexString('abcdef1234567890').ok()).toEqual(true);
  });
  it('should pass', () => {
    expect(utils.isHexString('0xABCDEF1234567890').ok()).toEqual(true);
  });
  it('should pass', () => {
    expect(utils.isHexString('aBcdEf1234567890').ok()).toEqual(true);
  });
  it('should pass', () => {
    expect(utils.isHexString('').ok()).toEqual(true);
  });
  it('should fail', () => {
    expect(utils.isHexString('z').err()).toBeTruthy();
  });
  it('should fail', () => {
    expect(utils.isHexString('0xz').err()).toBeTruthy();
  });
  it('should fail', () => {
    expect(utils.isHexString('0x0x').err()).toBeTruthy();
  });
  it('should fail', () => {
    expect(utils.isHexString('0xaBcDef1234567890-').err()).toBeTruthy();
  });
  it('should fail', () => {
    expect(utils.isHexString('-abcdEEf1234567890').err()).toBeTruthy();
  });
});

describe('isHexPrefixed', () => {
  it('should pass', () => {
    expect(utils.isHexPrefixed(utils.isHexString('0x').unwrap()).ok()).toBe(
      true,
    );
  });

  it('should pass', () => {
    expect(utils.isHexPrefixed(utils.isHexString('0x0').unwrap()).ok()).toBe(
      true,
    );
  });

  it('should pass', () => {
    expect(
      utils
        .isHexPrefixed(utils.isHexString('0xabcdef1234567890').unwrap())
        .ok(),
    ).toBe(true);
  });

  it('should fail', () => {
    expect(
      utils.isHexPrefixed(utils.isHexString('abcdef1234567890').unwrap()).err(),
    ).toBeTruthy();
  });
  it('should fail', () => {
    expect(
      utils.isHexPrefixed(utils.isHexString('00').unwrap()).err(),
    ).toBeTruthy();
  });

  it('should fail', () => {
    expect(
      utils.isHexPrefixed(utils.isHexString('0').unwrap()).err(),
    ).toBeTruthy();
  });

  it('should fail', () => {
    expect(
      utils.isHexPrefixed(utils.isHexString('').unwrap()).err(),
    ).toBeTruthy();
  });
});

describe('isPrefixedHexString', () => {
  it('should pass', () => {
    expect(utils.isPrefixedHexString('0x').ok()).toBe(true);
  });

  it('should pass', () => {
    expect(utils.isPrefixedHexString('0x0').ok()).toBe(true);
  });

  it('should pass', () => {
    expect(utils.isPrefixedHexString('0xabcdef1234567890').ok()).toBe(true);
  });

  it('should fail', () => {
    expect(utils.isPrefixedHexString('').err()).toEqual(
      ' does not have a hex prefix',
    );
  });

  it('should fail', () => {
    expect(utils.isPrefixedHexString('0').err()).toEqual(
      '0 does not have a hex prefix',
    );
  });

  it('should fail', () => {
    expect(utils.isPrefixedHexString('z').err()).toEqual(
      'z is not a hex string',
    );
  });

  it('should fail', () => {
    expect(utils.isPrefixedHexString('0xabcdef1234567890-').err()).toEqual(
      '0xabcdef1234567890- is not a hex string',
    );
  });
});

describe('isHexStrValidBytesLen', () => {
  const validateTwoBytes = utils.isHexStrValidBytesLen(2);

  it('should pass', () => {
    expect(validateTwoBytes(utils.isHexString('0000').unwrap()).ok()).toEqual(
      true,
    );
  });

  it('should pass', () => {
    expect(validateTwoBytes(utils.isHexString('0x0000').unwrap()).ok()).toEqual(
      true,
    );
  });

  it('should pass', () => {
    expect(validateTwoBytes(utils.isHexString('12ab').unwrap()).ok()).toEqual(
      true,
    );
  });

  it('should pass', () => {
    expect(validateTwoBytes(utils.isHexString('0x12AB').unwrap()).ok()).toEqual(
      true,
    );
  });

  it('should fail', () => {
    expect(
      validateTwoBytes(utils.isHexString('0x12ABa').unwrap()).err(),
    ).toEqual('0x12ABa is not a valid length, expected bytes length of 2');
  });

  it('should fail', () => {
    expect(validateTwoBytes(utils.isHexString('12ABa').unwrap()).err()).toEqual(
      '12ABa is not a valid length, expected bytes length of 2',
    );
  });

  it('should fail', () => {
    expect(validateTwoBytes(utils.isHexString('0x12a').unwrap()).err()).toEqual(
      '0x12a is not a valid length, expected bytes length of 2',
    );
  });

  it('should fail', () => {
    expect(validateTwoBytes(utils.isHexString('12a').unwrap()).err()).toEqual(
      '12a is not a valid length, expected bytes length of 2',
    );
  });
});

describe('isEvenlyPadded', () => {
  it('should pass', () => {
    expect(
      utils.isEvenlyPadded(utils.isHexString('0x12').unwrap()).ok(),
    ).toEqual(true);
  });

  it('should pass', () => {
    expect(utils.isEvenlyPadded(utils.isHexString('12').unwrap()).ok()).toEqual(
      true,
    );
  });

  it('should pass', () => {
    expect(utils.isEvenlyPadded(utils.isHexString('0x').unwrap()).ok()).toEqual(
      true,
    );
  });

  it('should pass', () => {
    expect(utils.isEvenlyPadded(utils.isHexString('').unwrap()).ok()).toEqual(
      true,
    );
  });

  it('should fail', () => {
    expect(utils.isEvenlyPadded(utils.isHexString('0').unwrap()).err()).toEqual(
      '0 is not evenly padded',
    );
  });

  it('should fail', () => {
    expect(
      utils.isEvenlyPadded(utils.isHexString('000').unwrap()).err(),
    ).toEqual('000 is not evenly padded');
  });

  it('should fail', () => {
    expect(
      utils.isEvenlyPadded(utils.isHexString('0x0').unwrap()).err(),
    ).toEqual('0x0 is not evenly padded');
  });

  it('should fail', () => {
    expect(
      utils.isEvenlyPadded(utils.isHexString('0x123').unwrap()).err(),
    ).toEqual('0x123 is not evenly padded');
  });
});

describe('isZeroValueHex', () => {
  it('should pass', () => {
    expect(utils.isZeroValueHex(utils.isHexString('').unwrap()).ok()).toEqual(
      true,
    );
  });

  it('should pass', () => {
    expect(utils.isZeroValueHex(utils.isHexString('0').unwrap()).ok()).toEqual(
      true,
    );
  });

  it('should pass', () => {
    expect(utils.isZeroValueHex(utils.isHexString('0x').unwrap()).ok()).toEqual(
      true,
    );
  });

  it('should pass', () => {
    expect(
      utils.isZeroValueHex(utils.isHexString('0x0').unwrap()).ok(),
    ).toEqual(true);
  });

  it('should pass', () => {
    expect(
      utils.isZeroValueHex(utils.isHexString('0x0000').unwrap()).ok(),
    ).toEqual(true);
  });

  it('should pass', () => {
    expect(
      utils.isZeroValueHex(utils.isHexString('0000').unwrap()).ok(),
    ).toEqual(true);
  });

  it('should fail', () => {
    expect(
      utils.isZeroValueHex(utils.isHexString('0001').unwrap()).err(),
    ).toEqual('0001 does not have a value of zero');
  });

  it('should fail', () => {
    expect(
      utils.isZeroValueHex(utils.isHexString('0001').unwrap()).err(),
    ).toEqual('0001 does not have a value of zero');
  });

  it('should fail', () => {
    expect(utils.isZeroValueHex(utils.isHexString('1').unwrap()).err()).toEqual(
      '1 does not have a value of zero',
    );
  });

  it('should fail', () => {
    expect(
      utils.isZeroValueHex(utils.isHexString('0x0001').unwrap()).err(),
    ).toEqual('0x0001 does not have a value of zero');
  });

  it('should fail', () => {
    expect(
      utils.isZeroValueHex(utils.isHexString('0x1').unwrap()).err(),
    ).toEqual('0x1 does not have a value of zero');
  });
});
