const express = require('express');
const { fetchServicesForPublic } = require('../controllers/service-controller');

const publicRoutes = express.Router();
publicRoutes.get('/services/fetch-services', fetchServicesForPublic);


module.exports = publicRoutes;