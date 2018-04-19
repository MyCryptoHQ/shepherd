export const idGeneratorFactory = () => {
  let callId = 0;
  return () => {
    const currValue = callId;
    callId += 1;
    return currValue;
  };
};
