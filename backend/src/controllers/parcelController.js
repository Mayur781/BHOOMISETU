const memoryStore = require('../config/inMemoryStore');
const LandParcel = require('../models/LandParcel');
const { isMongo } = require('../config/db');
const { logAction } = require('../middleware/auditLogger');

// GET /api/v1/parcels
const getParcels = async (req, res) => {
  try {
    const { projectId, district, status, search } = req.query;

    let parcels = [];
    if (projectId) {
      parcels = memoryStore.getParcelsByProject(projectId);
    } else {
      parcels = [...memoryStore.landParcels];
    }

    if (district) {
      parcels = parcels.filter(p => p.district.toLowerCase() === district.toLowerCase());
    }
    if (status) {
      parcels = parcels.filter(p => p.acquisitionStatus === status);
    }
    if (search) {
      const q = search.toLowerCase();
      parcels = parcels.filter(p =>
        p.khasraNumber.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        (p.owners && p.owners.some(o => o.name.toLowerCase().includes(q)))
      );
    }

    res.json({
      success: true,
      count: parcels.length,
      data: parcels
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve parcels.', error: err.message });
  }
};

// GET /api/v1/parcels/geojson/:projectId
// Returns GeoJSON FeatureCollection formatted specifically for Leaflet map layers
const getGeoJSONByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const parcels = memoryStore.getParcelsByProject(projectId);

    const features = parcels.map(parcel => {
      // Color coding based on RFCTLARR acquisition status
      let fillColor = '#3b82f6'; // blue default
      if (parcel.acquisitionStatus === 'Possession Transferred') fillColor = '#10b981'; // emerald
      else if (parcel.acquisitionStatus === 'Disbursed') fillColor = '#059669';
      else if (parcel.acquisitionStatus === 'Award Determined') fillColor = '#f59e0b'; // amber
      else if (parcel.acquisitionStatus === 'Disputed / In Court') fillColor = '#ef4444'; // red
      else if (parcel.acquisitionStatus === 'Sec 11 Notified') fillColor = '#8b5cf6'; // purple
      else if (parcel.acquisitionStatus === 'SIA Survey Complete') fillColor = '#06b6d4'; // cyan

      // Convert coordinates [ [ [lng, lat], ... ] ] to Leaflet lat/lng format
      // Note GeoJSON is [lng, lat], Leaflet is [lat, lng]
      return {
        type: 'Feature',
        id: parcel._id || parcel.id,
        properties: {
          id: parcel._id || parcel.id,
          khasraNumber: parcel.khasraNumber,
          village: parcel.village,
          tehsil: parcel.tehsil,
          district: parcel.district,
          state: parcel.state,
          landCategory: parcel.landCategory,
          totalAreaHectares: parcel.totalAreaHectares,
          acquiredAreaHectares: parcel.acquiredAreaHectares,
          circleRatePerHectare: parcel.circleRatePerHectare,
          marketValuePerHectare: parcel.marketValuePerHectare,
          acquisitionStatus: parcel.acquisitionStatus,
          owners: parcel.owners,
          gisAttributes: parcel.gisAttributes,
          fillColor,
          strokeColor: '#0f2942'
        },
        geometry: parcel.geometry
      };
    });

    const featureCollection = {
      type: 'FeatureCollection',
      projectId,
      totalFeatures: features.length,
      features
    };

    res.json({
      success: true,
      data: featureCollection
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate GeoJSON.', error: err.message });
  }
};

// POST /api/v1/parcels
const createParcel = async (req, res) => {
  try {
    const {
      projectId,
      khasraNumber,
      state,
      district,
      tehsil,
      village,
      landCategory,
      totalAreaHectares,
      acquiredAreaHectares,
      circleRatePerHectare,
      marketValuePerHectare,
      owners,
      coordinates,
      treesCount,
      structuresCount
    } = req.body;

    if (!projectId || !khasraNumber || !village || !acquiredAreaHectares || !circleRatePerHectare) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory fields: projectId, khasraNumber, village, acquiredAreaHectares, circleRatePerHectare are required.'
      });
    }

    // Default polygon if none provided
    const defaultPolygon = [
      [
        [73.1485 + Math.random() * 0.02, 19.3421 + Math.random() * 0.02],
        [73.1512 + Math.random() * 0.02, 19.3425 + Math.random() * 0.02],
        [73.1508 + Math.random() * 0.02, 19.3458 + Math.random() * 0.02],
        [73.1481 + Math.random() * 0.02, 19.3452 + Math.random() * 0.02],
        [73.1485 + Math.random() * 0.02, 19.3421 + Math.random() * 0.02]
      ]
    ];

    const parcelData = {
      projectId,
      khasraNumber,
      state: state || 'Maharashtra',
      district: district || 'Thane',
      tehsil: tehsil || 'Bhiwandi',
      village,
      landCategory: landCategory || 'Private Agricultural (Irrigated)',
      totalAreaHectares: Number(totalAreaHectares || acquiredAreaHectares),
      acquiredAreaHectares: Number(acquiredAreaHectares),
      circleRatePerHectare: Number(circleRatePerHectare),
      marketValuePerHectare: Number(marketValuePerHectare || circleRatePerHectare * 1.15),
      acquisitionStatus: 'Proposed',
      owners: owners || [{ name: 'Shri Landowner Representative', sharePercentage: 100 }],
      geometry: {
        type: 'Polygon',
        coordinates: coordinates || defaultPolygon
      },
      gisAttributes: {
        centroid: { lat: 19.344 + Math.random() * 0.01, lng: 73.15 + Math.random() * 0.01 },
        encroachmentRisk: 'None',
        treesCount: Number(treesCount || 0),
        structuresCount: Number(structuresCount || 0),
        jointMeasurementSurveyDone: false
      }
    };

    const newParcel = memoryStore.createParcel(parcelData);

    await logAction({
      user: req.user,
      action: 'PARCEL_CREATED',
      resourceType: 'LandParcel',
      resourceId: newParcel._id || newParcel.id,
      description: `Survey Khasra ${khasraNumber} in village ${village} registered under Project ${projectId}.`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Land parcel registered successfully.',
      data: newParcel
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create parcel.', error: err.message });
  }
};

// PUT /api/v1/parcels/:id
const updateParcel = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = memoryStore.updateParcel(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Land parcel not found.' });
    }

    await logAction({
      user: req.user,
      action: 'PARCEL_UPDATED',
      resourceType: 'LandParcel',
      resourceId: id,
      description: `Land parcel ${updated.khasraNumber} status updated to ${updated.acquisitionStatus}.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Land parcel updated.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.', error: err.message });
  }
};

module.exports = {
  getParcels,
  getGeoJSONByProject,
  createParcel,
  updateParcel
};
