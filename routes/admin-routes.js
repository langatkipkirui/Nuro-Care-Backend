const express = require('express');
const { adminAuth } = require('../controllers/admin-auth-controller');
const { uploadSingle } = require('../middlewares/image-middleware');
const {
  handleProfileImageUpload,
} = require('../controllers/profile-image-controller');
const {
  createNewService,
  addServiceImages,
  fetchAllServices,
} = require('../controllers/service-controller');
const { uploadMultiple } = require('../middlewares/images-middleware');
const {
  updateSiteSettings,
  updateSiteHeroImageAndVideo,
} = require('../controllers/site-settings-controller');
const uploadVideo = require('../middlewares/video-middleware');
const adminRouter = express.Router();

// create a new service
adminRouter.post('/services/create-new-service', adminAuth, createNewService);
// add service images
adminRouter.post(
  '/services/add-service-images',
  adminAuth,
  uploadMultiple.array('gallery', 7),
  addServiceImages,
);
// fetch all services for admin
adminRouter.get('/services/fetch-all-services', adminAuth, fetchAllServices);

// upload images
adminRouter.post(
  '/profile-image-upload',
  adminAuth,
  uploadSingle.single('image'),
  handleProfileImageUpload,
);

adminRouter.post(
  '/site-settings/update-site-settings',
  adminAuth,
  updateSiteSettings,
);
adminRouter.post(
  '/site-settings/update-site-hero-image',
  adminAuth,
  uploadSingle.single('image'),
  updateSiteHeroImageAndVideo,
);
adminRouter.post(
  '/site-settings/update-site-trust-video',
  adminAuth,
  uploadVideo.single('video'),
  updateSiteHeroImageAndVideo,
);
module.exports = adminRouter;
