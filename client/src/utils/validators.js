export const validateEmail = (email) => {
  const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateForm = (formData, rules) => {
  const errors = {};
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = formData[field];

    if (rule.required && !value) {
      errors[field] = `${field} is required`;
    } else if (rule.type === 'email' && !validateEmail(value)) {
      errors[field] = 'Invalid email format';
    } else if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
    }
  });
  return errors;
};
