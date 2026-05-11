export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const generateTimestamp = (): number => {
  return Date.now();
};
