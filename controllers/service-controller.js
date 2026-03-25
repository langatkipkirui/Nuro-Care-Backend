const Service = require('../models/service-model');
const slugify = require('slugify');
const { uploadMultipleToCloudinary } = require('./upload-controller');
const SiteSettings = require('../models/site-settings')
// create a new service
async function createNewService(req, res) {
  console.log(req.body);
  try {
    const {
      Title,
      ServiceHeroTitle,
      MetaDescription,
      ServiceKeywords,
      ServiceHeroDescription,
      ServiceOverview,
      ServiceBenefits,
      ServiceProcess,
      TargetAudience,
      ServiceInclusion,
      ServiceFeatures,
      ServiceCoverageAreas,
      ServiceFAQs,
      PricingNote,
      CTATitle,
      CTADescription,
      ServiceDuration,
      Pricing,
      IsActive,
      IsFeatured,
    } = req.body;
    if (
      Title === '' ||
      !Title ||
      ServiceHeroTitle === '' ||
      !ServiceHeroTitle ||
      MetaDescription === '' ||
      !MetaDescription ||
      ServiceKeywords.length === 0 ||
      !ServiceKeywords ||
      ServiceHeroDescription === '' ||
      !ServiceHeroDescription ||
      ServiceOverview === '' ||
      !ServiceOverview ||
      ServiceBenefits.length === 0 ||
      !ServiceBenefits ||
      ServiceProcess.length === 0 ||
      !ServiceProcess ||
      TargetAudience.length === 0 ||
      !TargetAudience ||
      ServiceInclusion.length === 0 ||
      !ServiceInclusion ||
      ServiceFeatures.length === 0 ||
      !ServiceFeatures ||
      ServiceCoverageAreas.length === 0 ||
      !ServiceCoverageAreas ||
      ServiceFAQs.length === 0 ||
      !ServiceFAQs ||
      PricingNote === '' ||
      !PricingNote ||
      CTATitle === '' ||
      !CTATitle ||
      CTADescription === '' ||
      !CTADescription ||
      Pricing.dailyRate === '' ||
      !Pricing.dailyRate ||
      !Pricing.monthlyRate ||
      !Pricing ||
      Pricing.monthlyRate === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'All the fields are required',
      });
    }

    const ServiceSlug = slugify(Title, { lower: true, strict: true });

    // finding if the services already exists
    const existingService = await Service.findOne({ ServiceSlug });
    if (existingService) {
      return res.status(409).json({
        success: false,
        message: 'Service already exists. Do you want to edit the service?',
      });
    }

    const newlyCreatedService = new Service({
      Title,
      ServiceCoverImage: null,
      ServiceSlug,
      Gallery: null,
      ServiceHeroTitle,
      MetaDescription,
      ServiceKeywords,
      ServiceHeroDescription,
      ServiceOverview,
      ServiceBenefits,
      ServiceProcess,
      TargetAudience,
      ServiceInclusion,
      ServiceFeatures,
      ServiceCoverageAreas,
      ServiceFAQs,
      PricingNote,
      CTATitle,
      CTADescription,
      ServiceDuration,
      Pricing,
      IsActive,
      IsFeatured,
    });
    await newlyCreatedService.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      id: newlyCreatedService._id
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred. Please try again',
      error: error?.message,
    });
  }
}

// add service images
async function addServiceImages(req, res) {

  try {
    const { serviceId } = req.body;

    if (!serviceId) throw new Error();

    const service = await Service.findOne({ _id: serviceId });
    if (!service) {
      return res.status(400).json({
        success: false,
        message: 'Some error occurred while adding service images. Please try recreating the service.'
      });
    }
    // cloudinary response on upload of images
    const result = await uploadMultipleToCloudinary(
      req.files,
      "services/gallery",
    );
    if (!result) throw new Error("Some error occurred");
    const gallery = result.filter((_, index) => index !== 0);

    const ServiceCoverImage = {
      url: result[0]?.url,
      publicId: result[0]?.publicId,
    };


    service.ServiceCoverImage = ServiceCoverImage,
      service.Gallery = gallery;

    await service.save();

    res.status(201).json({
      success: true,
      message: "Images added successfully",
      service
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred. Please try again',
      error: error?.message,
    });
  }


}

// fetch services

async function fetchAllServices(req, res) {
  try {
    const services = await Service.find({});

    res.status(201).json({
      sucess: true,
      services,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred. Please try again',
      error: error?.message,
    });
  }
}

// fetch services for public/site

async function fetchServicesForPublic(req, res) {
  try {
    const services = await Service.find({});
    const requiredInfo = [];
    services.forEach((service) => {
      let formattedService = {};
      formattedService.Title = service.Title;
      formattedService.ServiceCoverImage = service.ServiceCoverImage;
      formattedService.Gallery = service.Gallery;
      formattedService.ServiceSlug = service.ServiceSlug;
      formattedService.ServiceHeroTitle = service.ServiceHeroTitle;
      formattedService.MetaDescription = service.MetaDescription;
      formattedService.ServiceKeywords = service.ServiceKeywords;
      formattedService.ServiceHeroDescription = service.ServiceHeroDescription;
      formattedService.ServiceOverview = service.ServiceOverview;
      formattedService.ServiceBenefits = service.ServiceBenefits;
      formattedService.ServiceProcess = service.ServiceProcess;
      formattedService.TargetAudience = service.TargetAudience;
      formattedService.ServiceInclusion = service.ServiceInclusion;
      formattedService.ServiceFeatures = service.ServiceFeatures;
      formattedService.ServiceCoverageAreas = service.ServiceCoverageAreas;
      formattedService.serviceFAQs = service.ServiceFAQs;
      formattedService.PricingNote = service.PricingNote;
      formattedService.CTATitle = service.CTATitle;
      formattedService.CTADescription = service.CTADescription;
      formattedService.ServiceDuration = service.ServiceDuration;
      formattedService.Pricing = service.Pricing;
      formattedService.IsActive = service.IsActive;
      formattedService.IsFeatured = service.IsFeatured;
      requiredInfo.push(formattedService);
    });
    const currentSiteSettings = await SiteSettings.findOne({});

    res.status(201).json({
      sucess: true,
      requiredInfo,
      currentSiteSettings
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred.',
      error: error?.message,
    });
  }
}


module.exports = { createNewService, addServiceImages, fetchAllServices, fetchServicesForPublic };
