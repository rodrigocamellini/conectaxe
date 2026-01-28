
/**
 * Common validation and formatting utilities for the application.
 * Centralizes validation logic to prepare for backend migration.
 */

// --- Validators ---

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) 
    sum = sum + parseInt(cleaned.substring(i-1, i)) * (11 - i);
  
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) 
    sum = sum + parseInt(cleaned.substring(i-1, i)) * (12 - i);
  
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;

  return true;
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

// --- Formatters ---

export const formatCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatRG = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})/, '$1-$2');
};

export const formatPhone = (value: string): string => {
  const v = value.replace(/\D/g, '');
  if (v.length > 10) {
    return v
      .replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (v.length > 5) {
    return v
      .replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (v.length > 2) {
    return v
      .replace(/^(\d\d)(\d{0,5}).*/, '($1) $2');
  } else {
    return v.replace(/^(\d*)/, '($1');
  }
};

export const formatCEP = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

// Group export for default usage if needed elsewhere
export const Validators = {
  email: validateEmail,
  phone: validatePhone,
  cpf: validateCPF,
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  }
};
