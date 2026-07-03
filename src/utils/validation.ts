interface FormData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  return name.trim().length > 0;
};

export const validateForm = (formData: FormData, type: string = 'login'): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!formData['email']) {
    errors['email'] = 'Email is required';
  } else if (!validateEmail(formData['email'])) {
    errors['email'] = 'Invalid email format';
  }

  if (!formData['password']) {
    errors['password'] = 'Password is required';
  } else if (!validatePassword(formData['password'])) {
    errors['password'] = 'Password must be at least 6 characters';
  }

  if (type === 'register') {
    if (!formData['firstName']) {
      errors['firstName'] = 'First name is required';
    } else if (!validateName(formData['firstName'])) {
      errors['firstName'] = 'First name cannot be empty';
    }

    if (!formData['lastName']) {
      errors['lastName'] = 'Last name is required';
    } else if (!validateName(formData['lastName'])) {
      errors['lastName'] = 'Last name cannot be empty';
    }

    if (!formData['confirmPassword']) {
      errors['confirmPassword'] = 'Confirm password is required';
    } else if (formData['password'] !== formData['confirmPassword']) {
      errors['confirmPassword'] = 'Passwords do not match';
    }
  }

  return errors;
};
