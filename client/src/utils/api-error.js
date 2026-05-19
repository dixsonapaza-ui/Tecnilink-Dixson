export const getApiErrorMessage = (error, fallback = 'Ocurrio un error inesperado.') => {
  const message = error?.response?.data?.message;

  if (message) {
    return message;
  }

  if (error?.response?.data?.errors?.length > 0) {
    return error.response.data.errors.map((item) => item.message).join(' ');
  }

  return fallback;
};
