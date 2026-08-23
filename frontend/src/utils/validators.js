export const validateName = (name) => {
  if (name.length < 20 || name.length > 60) {
    return 'Name must be between 20 and 60 characters';
  }
  return '';
};

export const validateAddress = (address) => {
  if (!address || address.length > 400) {
    return 'Address is required and must be at most 400 characters';
  }
  return '';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Enter a valid email address';
  return '';
};

export const validatePassword = (password) => {
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return '';
};
