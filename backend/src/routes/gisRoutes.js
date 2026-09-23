const express = require('express');
const router = express.Router();
const gisController = require('../controllers/gisController');
const { authenticate } = require('../middleware/auth');

// Public/Authenticated GIS Endpoints
router.get('/map-data', gisController.getMapData);
router.get('/statistics', gisController.getStatistics);
router.get('/geojson', gisController.getGeoJSON);
router.get('/parcels', gisController.getParcels);
router.get('/parcels/:id', gisController.getParcelById);

module.exports = router;
