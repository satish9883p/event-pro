import Event from '../models/Event.js';

export const getEventContextForAI = async (published = true) => {
  try {
    const query = published ? { status: 'Published' } : {};
    const events = await Event.find(query)
      .select('title description category date startTime endTime venue location capacity registrationDeadline eligibility status')
      .limit(20)
      .sort({ date: 1 });

    return events;
  } catch (error) {
    console.error('Error fetching event context:', error);
    return [];
  }
};

export const searchEventsForAI = async (query) => {
  try {
    const events = await Event.find(
      { $text: { $search: query }, status: 'Published' },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);

    return events;
  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
};
