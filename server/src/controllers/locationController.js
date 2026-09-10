import Location from '../models/Location.js';

export const getLocationHierarchy = async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ state: 1, district: 1 });

    // Build hierarchical structure
    const hierarchy = {};

    locations.forEach((loc) => {
      if (!hierarchy[loc.state]) {
        hierarchy[loc.state] = {};
      }
      hierarchy[loc.state][loc.district] = loc.areas || [];
    });

    res.status(200).json({
      success: true,
      data: hierarchy,
      raw: locations,
    });
  } catch (error) {
    next(error);
  }
};

export const getStates = async (req, res, next) => {
  try {
    const states = await Location.distinct('state');
    res.status(200).json({
      success: true,
      data: states.sort(),
    });
  } catch (error) {
    next(error);
  }
};

export const getDistricts = async (req, res, next) => {
  try {
    const { state } = req.query;
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State query parameter is required',
      });
    }

    const districts = await Location.find({
      state: { $regex: new RegExp(`^${state}$`, 'i') },
    }).distinct('district');

    res.status(200).json({
      success: true,
      data: districts.sort(),
    });
  } catch (error) {
    next(error);
  }
};

export const getAreas = async (req, res, next) => {
  try {
    const { state, district } = req.query;
    if (!state || !district) {
      return res.status(400).json({
        success: false,
        message: 'Both state and district query parameters are required',
      });
    }

    const loc = await Location.findOne({
      state: { $regex: new RegExp(`^${state}$`, 'i') },
      district: { $regex: new RegExp(`^${district}$`, 'i') },
    });

    res.status(200).json({
      success: true,
      data: loc ? loc.areas.sort() : [],
    });
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const { state, district, areas } = req.body;

    if (!state || !district) {
      return res.status(400).json({
        success: false,
        message: 'State and district are required',
      });
    }

    const cleanAreas = Array.isArray(areas)
      ? areas.map((a) => a.trim()).filter(Boolean)
      : typeof areas === 'string'
      ? areas.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    const existing = await Location.findOne({
      state: { $regex: new RegExp(`^${state.trim()}$`, 'i') },
      district: { $regex: new RegExp(`^${district.trim()}$`, 'i') },
    });

    if (existing) {
      // Merge areas
      const combined = Array.from(new Set([...existing.areas, ...cleanAreas]));
      existing.areas = combined;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: 'Location updated with new areas',
        data: existing,
      });
    }

    const location = await Location.create({
      state: state.trim(),
      district: district.trim(),
      areas: cleanAreas,
    });

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
