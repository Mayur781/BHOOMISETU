const memoryStore = require('../config/inMemoryStore');
const LandParcel = require('../models/LandParcel');
const Project = require('../models/Project');
const { isMongo } = require('../config/db');

// GET /api/v1/gis/map-data
// Returns comprehensive spatial payload: Project markers + Land parcel GeoJSON FeatureCollection + Statistics
const getMapData = async (req, res) => {
  try {
    const { state, district, projectId, status, search } = req.query;
    const filters = { state, district, projectId, status, search };

    const mapData = memoryStore.getGisMapData(filters);
    res.json({
      success: true,
      ...mapData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve GIS map data.',
      error: err.message
    });
  }
};

// GET /api/v1/gis/parcels
// Returns filtered list of cadastral parcels with full spatial & statutory particulars
const getParcels = async (req, res) => {
  try {
    const { state, district, projectId, status, search } = req.query;
    const filters = { state, district, projectId, status, search };

    const parcels = memoryStore.getGisParcels(filters);
    res.json({
      success: true,
      count: parcels.length,
      data: parcels
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve GIS parcels.',
      error: err.message
    });
  }
};

// GET /api/v1/gis/parcels/:id
// Returns single parcel with detailed dossier (compensation, possession, R&R, owners)
const getParcelById = async (req, res) => {
  try {
    const { id } = req.params;
    const parcel = memoryStore.findGisParcelById(id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: `Land parcel '${id}' not found.`
      });
    }

    res.json({
      success: true,
      data: parcel
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve land parcel particulars.',
      error: err.message
    });
  }
};

// GET /api/v1/gis/statistics
// Returns map statistics: Total parcels, Proposed, Acquired, Compensation completed, Possession completed
const getStatistics = async (req, res) => {
  try {
    const { state, district, projectId, status } = req.query;
    const filters = { state, district, projectId, status };

    const stats = memoryStore.getGisStatistics(filters);
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate GIS statistics.',
      error: err.message
    });
  }
};

// GET /api/v1/gis/geojson
// Returns pure GeoJSON FeatureCollection formatted specifically for Leaflet L.geoJSON
const getGeoJSON = async (req, res) => {
  try {
    const { state, district, projectId, status, search } = req.query;
    const mapData = memoryStore.getGisMapData({ state, district, projectId, status, search });

    res.json({
      success: true,
      data: mapData.parcels
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate GeoJSON layer.',
      error: err.message
    });
  }
};

module.exports = {
  getMapData,
  getParcels,
  getParcelById,
  getStatistics,
  getGeoJSON
};
