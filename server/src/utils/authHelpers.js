export const normalizeRole = (role = '') => String(role || '').trim().toLowerCase().replace(/\s+/g, '_');

export const resolveLoginIdentifier = (value = '') => {
  const identifier = String(value || '').trim();
  if (!identifier) return '';
  return identifier.toLowerCase();
};

export const isAdminCredentials = (identifier = '', password = '') => {
  const normalizedIdentifier = resolveLoginIdentifier(identifier);
  return (normalizedIdentifier === 'admin' || normalizedIdentifier === 'admin@eventpro.com') && String(password || '') === 'admin123';
};
