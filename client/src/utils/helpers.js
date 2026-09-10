export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDateTime = (date, time) => {
  return `${formatDate(date)}, ${formatTime(time)}`;
};

export const isUpcomingEvent = (eventDate) => {
  return new Date(eventDate) > new Date();
};

export const isRegistrationDeadlinePassed = (deadline) => {
  return new Date(deadline) < new Date();
};

export const getAvailableSeats = (capacity, registrationCount) => {
  const available = capacity - registrationCount;
  return available > 0 ? available : 0;
};
