const getEnvVariable = (name: string): string => {
  const variable = process.env[name]?.trim() ?? '';
  if (variable === '') {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return variable;
};

const mapsToNumber = (name: string) => {
  return () => {
    const value = getEnvVariable(name);
    const parsed = Number(value);
    if (isNaN(parsed)) {
      throw new Error(`Invalid number value for environment variable ${name}: ${value}`);
    }
    return parsed;
  };
};

export const getPort = mapsToNumber('PORT');

export const getCorsOrigin = () => {
  const corsOrigin = process.env.CORS_ORIGIN?.trim() ?? 'http://localhost:3000';
  return corsOrigin.split(',').map(origin => origin.trim());
};
