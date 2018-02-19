export const isInputNaturalNumber = (input) => {
  const numericInput = Number(input);

  return !Number.isNaN(numericInput) && (numericInput % 1) === 0 && numericInput > 0;
};
