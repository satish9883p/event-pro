import Joi from 'joi';

export const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().max(50),
    username: Joi.string().allow('', null).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    phone: Joi.string().allow('', null),
    role: Joi.string().valid('user', 'venue_owner', 'admin').default('user'),
  });
  return schema.validate(data);
};

export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.alternatives().try(Joi.string().email(), Joi.string().min(1).max(100)).required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

export const validateEvent = (data) => {
  const schema = Joi.object({
    title: Joi.string().required().max(150),
    description: Joi.string().required(),
    category: Joi.string().required(),
    organizer: Joi.string().allow('', null).default('Event Pro'),
    date: Joi.date().required(),
    startTime: Joi.string().allow('', null).default('09:00'),
    endTime: Joi.string().allow('', null).default('18:00'),
    venue: Joi.string().required(),
    location: Joi.string().allow('', null),
    state: Joi.string().allow('', null).default('Andhra Pradesh'),
    district: Joi.string().allow('', null).default('Krishna'),
    area: Joi.string().allow('', null).default('Vijayawada'),
    capacity: Joi.number().min(1).required(),
    availableSlots: Joi.number().min(0).allow(null),
    price: Joi.number().min(0).default(0),
    timeSlots: Joi.array().items(Joi.string()).allow(null),
    registrationDeadline: Joi.date().allow(null),
    eligibility: Joi.string().allow('', null).default('All'),
    contactEmail: Joi.string().allow('', null),
    contactPhone: Joi.string().allow('', null),
    image: Joi.string().allow('', null),
    images: Joi.array().items(Joi.string()).allow(null),
    status: Joi.string().valid('Draft', 'Published', 'Completed', 'Cancelled').default('Published'),
  });
  return schema.validate(data, { stripUnknown: true });
};

export const validateFunctionHall = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().required(),
    state: Joi.string().required(),
    district: Joi.string().required(),
    area: Joi.string().required(),
    fullAddress: Joi.string().required(),
    mapQuery: Joi.string().allow('', null),
    images: Joi.array().items(Joi.string()).allow(null),
    capacity: Joi.number().min(10).required(),
    facilities: Joi.array().items(Joi.string()).allow(null),
    price: Joi.number().min(0).required(),
    additionalServices: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          price: Joi.number().min(0).required(),
          description: Joi.string().allow('', null),
        })
      )
      .allow(null),
    availableDates: Joi.array().items(Joi.date()).allow(null),
    availableTimeSlots: Joi.array().items(Joi.string()).allow(null),
    type: Joi.string()
      .valid(
        'Banquet Hall',
        'Convention Center',
        'Convention Hall',
        'Marriage Hall',
        'Kalyana Mandapam',
        'Party Lawn',
        'Rooftop Venue',
        'Community Hall',
        'Heritage Convention Hall',
        'Other'
      )
      .default('Banquet Hall'),
    acType: Joi.string().valid('Central AC', 'Split AC', 'AC', 'Non-AC').default('Central AC'),
    parking: Joi.string().allow('', null),
    stage: Joi.string().allow('', null),
    catering: Joi.string().allow('', null),
    availability: Joi.string().valid('Available', 'Booked', 'Maintenance').default('Available'),
  });
  return schema.validate(data, { stripUnknown: true });
};

export const validateBooking = (data) => {
  const schema = Joi.object({
    bookingType: Joi.string().valid('hall', 'event').required(),
    hallId: Joi.string().allow(null, ''),
    eventId: Joi.string().allow(null, ''),
    date: Joi.date().required(),
    timeSlot: Joi.string().required(),
    basePrice: Joi.number().min(0),
    additionalServices: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          price: Joi.number().min(0).required(),
        })
      )
      .default([]),
    guestCount: Joi.number().min(1).default(1),
    contactName: Joi.string().allow('', null),
    contactPhone: Joi.string().allow('', null),
    contactEmail: Joi.string().email().allow('', null),
    specialRequests: Joi.string().allow('', null),
  });
  return schema.validate(data);
};

export const validateUpdateProfile = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(50),
    phone: Joi.string().allow('', null),
    organization: Joi.string().allow('', null),
  });
  return schema.validate(data);
};

export const validateChangePassword = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
  });
  return schema.validate(data);
};
