const SiteSettings = require('../models/site-settings');
const { uploadToCloudinary } = require('./upload-controller');
const cloudinary = require('../config/cloudinary');

async function updateSiteSettings(req, res) {
  try {
    const {
      heroTitle,
      heroDescription,
      trustSectionTitle,
      trustSectionDescription,
      whyNuroTitle,
      whyNuroDescription,
      trustKeywords,
      homepageFaqs,
    } = req.body;

    const whyTitle = whyNuroTitle;
    const whyDescription = whyNuroDescription;

    if (
      !heroTitle ||
      heroTitle.length < 40 ||
      !heroDescription ||
      heroDescription.length < 100 ||
      !trustSectionTitle ||
      trustSectionTitle.length < 10 ||
      !trustSectionDescription ||
      trustSectionDescription.length < 100 ||
      !whyTitle ||
      whyTitle.length < 10 ||
      !whyDescription ||
      whyDescription.length < 100 ||
      !trustKeywords ||
      trustKeywords.length < 1 ||
      !homepageFaqs ||
      homepageFaqs.length < 1
    ) {
      return res.status(400).json({
        sucess: false,
        message: 'All fields are required',
      });
    }
    const currentSiteSettings = await SiteSettings.findOne({});

    if (!currentSiteSettings) {
      const newSettings = new SiteSettings({
        HeroHeader: heroTitle,
        HeroSubHeader: heroDescription,
        HeroImage: {
          url: 'https://res.cloudinary.com/dwwaetdws/image/upload/w_960,c_fill,q_auto,f_auto/v1767189325/realistic-scene-with-elderly-care-senior-people_l1mbnf',
          publicId: null,
        },
        TrustHeader: trustSectionTitle,
        TrustVideo: {
          url: 'https://res.cloudinary.com/dwwaetdws/video/upload/v1770044682/7522364-uhd_3840_2160_25fps_ar8xu2.mp4',
          publicId: null,
        },
        TrustSubHeader: trustSectionDescription,
        WhyNuroHeader: whyTitle,
        WhyNuroSubHeader: whyDescription,
        WhyNuroTrustPoints: trustKeywords,
        HomePageFaqs: homepageFaqs,
      });

      await newSettings.save();
      return res.status(200).json({
        success: true,
        message: 'Site settings have been updated sucessfully',
      });
    }
    currentSiteSettings.HeroHeader = heroTitle;
    ((currentSiteSettings.HeroImage.publicId = null),
      (currentSiteSettings.HeroSubHeader = heroDescription));
    ((currentSiteSettings.HeroImage.url =
      'https://res.cloudinary.com/dwwaetdws/image/upload/w_960,c_fill,q_auto,f_auto/v1767189325/realistic-scene-with-elderly-care-senior-people_l1mbnf'),
      (currentSiteSettings.TrustHeader = trustSectionTitle));
    currentSiteSettings.TrustSubHeader = trustSectionDescription;
    currentSiteSettings.WhyNuroHeader = whyTitle;
    currentSiteSettings.WhyNuroSubHeader = whyDescription;
    currentSiteSettings.WhyNuroTrustPoints = trustKeywords;
    ((currentSiteSettings.TrustVideo.publicId = null),
      (currentSiteSettings.HomePageFaqs = homepageFaqs));
    ((currentSiteSettings.TrustVideo.url =
      'https://res.cloudinary.com/dwwaetdws/video/upload/v1770044682/7522364-uhd_3840_2160_25fps_ar8xu2.mp4'),
      await currentSiteSettings.save());
    res.status(200).json({
      success: true,
      message: 'Site settings have been updated sucessfully',
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

async function updateSiteHeroImageAndVideo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File not available',
      });
    }
    const currentSiteSettings = await SiteSettings.findOne({});
    if (!currentSiteSettings) {
      throw new Error('Bad request');
    }
    if (req.file.fieldname === 'image') {
      const { secure_url, public_id } = await uploadToCloudinary(
        req.file.buffer,
        'hero image',
      );

      currentSiteSettings.HeroImage.url = secure_url;
      currentSiteSettings.HeroImage.publicId = public_id;
      await currentSiteSettings.save();
      return res.status(200).json({
        success: true,
        message: 'Hero image added sucessfully',
      });
    } else if (req.file.fieldname === 'video') {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          resource_type: 'video',
          folder: 'videos',
        },
      );

      currentSiteSettings.TrustVideo.url = secure_url;
      currentSiteSettings.TrustVideo.publicId = public_id;
      await currentSiteSettings.save();
      return res.status(200).json({
        success: true,
        message: 'Trust video added sucessfully',
      });
    } else {
      throw new Error('Some error occured. Please try again');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred. Please try again',
      error: error?.message,
    });
  }
}

module.exports = { updateSiteSettings, updateSiteHeroImageAndVideo };
