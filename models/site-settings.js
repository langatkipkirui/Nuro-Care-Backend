const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
  HeroHeader: {
    type: String,
    default:
      'Trusted Home Care Services in Nairobi – Compassionate Care Right at Home',
  },
  HeroSubHeader: {
    type: String,
    default:
      'At Mekin Home Care, we provide reliable and compassionate home-based healthcare services in Nairobi, tailored to meet the unique needs of every patient.Our experienced caregivers and licensed healthcare professionals deliver quality care in the comfort of your home.',
  },

  HeroImage: {
    type: {
      url: {
        type: String,
        default:
          'https://res.cloudinary.com/dwwaetdws/image/upload/w_960,c_fill,q_auto,f_auto/v1767189325/realistic-scene-with-elderly-care-senior-people_l1mbnf',
      },
      publicId: {
        type: String,
        default: null,
      },
    },
  },
  // trust section
  TrustHeader: {
    type: String,
    default:
      'At Mekin Home Care in Nairobi, we don’t just provide professional caregivers — we deliver peace of mind through a rigorous safety framework designed to protect your family.',
  },
  // trust section
  TrustSubHeader: {
    type: String,
    default:
      'At Mekin Home Care in Nairobi, we don’t just provide professional caregivers — we deliver peace of mind through a rigorous safety framework designed to protect your family. Our licensed nurses and trained caregivers treat your loved ones like our own. Safety and compassionate care aren’t just policies at Mekin — they’re promises we keep every single day, whether it’s post-surgical support, chronic disease management, or elderly care at home.',
  },
  CEOAvatar: {
    type: String,
    default:
      'https://res.cloudinary.com/dwwaetdws/image/upload/w_96,c_fill,q_auto,f_auto/v1767278136/founder_pfhpj3',
  },
  CEOFullName: {
    type: 'String',
    default: 'Damacline Nyasaka',
  },
  // why mekin section
  TrustVideo: {
    type: {
      url: {
        type: String,
        default:
          'https://res.cloudinary.com/dwwaetdws/video/upload/v1770044682/7522364-uhd_3840_2160_25fps_ar8xu2.mp4',
      },
      publicId: {
        type: String,
        default: null,
      },
    },
  },

  WhyMekinHeader: {
    type: String,
    default:
      'Why Mekin is the Trusted Choice for Skilled Home-Based Medical Care in Nairobi.',
  },
  WhyMekinSubHeader: {
    type: String,
    default:
      'From 24/7 skilled nursing to specialized rehabilitation, Mekin delivers hospital-grade medical excellence directly to your doorstep, ensuring safety, dignity, and professional recovery at home.',
  },
  WhyMekinTrustPoints: {
    type: Array,
    default: [
      'Licensed & Vetted Professionals',
      'Personalized Care Plans',
      'Hospital-Grade Care at Home',
      'Reliable, On-Time Support',
      'Transparent Pricing',
      'Compassion Beyond Care',
    ],
  },
  HomePageFaqs: {
    type: [
      {
        question: String,
        answer: String,
      },
    ],
    default: [
      {
        question: 'What is home based care and how does it work in Nairobi?',
        answer:
          'Home based care involves professional healthcare services delivered in the comfort of your home. In Nairobi, Mekin Homecare provides licensed nurses and certified caregivers who assess your needs, create a personalized care plan, and deliver ongoing medical or supportive care without the need for hospital visits.',
      },
      {
        question: 'What services does Mekin Home Based Care offer?',
        answer:
          'Mekin Homecare offers nursing care, post-surgical recovery support, chronic disease management, elderly care, disability support, and palliative care. All services are provided by trained professionals and tailored to each client’s medical and personal needs.',
      },
      {
        question: 'Are Mekin caregivers and nurses qualified and licensed?',
        answer:
          'Yes. Every Mekin nurse and caregiver is fully licensed or certified, background-checked, insured, and trained through a rigorous multi-step vetting process to ensure safety, professionalism, and compassionate care.',
      },
      {
        question: 'How much does home based care cost in Nairobi?',
        answer:
          'The cost of home based care in Nairobi depends on the type of service, level of care required, and duration. Mekin Homecare offers flexible daily services and structured monthly care plans with transparent pricing and no hidden fees.',
      },
      {
        question: 'Can I get nursing care at home after surgery?',
        answer:
          'Yes. Mekin Homecare provides post-surgical nursing care at home, including wound care, medication management, mobility assistance, and recovery monitoring to help patients heal safely and comfortably.',
      },
      {
        question: 'Do you offer home care services for elderly patients?',
        answer:
          'Absolutely. We specialize in elderly home care, offering daily assistance, health monitoring, companionship, and nursing support to help seniors maintain dignity, independence, and quality of life.',
      },
      {
        question:
          'How quickly can home care services start after I request care?',
        answer:
          'In most cases, Mekin Homecare can assess your needs and begin care within 24 hours of your request, depending on location and service requirements within the Nairobi metropolitan area.',
      },
      {
        question:
          'Can family members receive updates about the patient’s care?',
        answer:
          'Yes. We provide regular updates and clear communication to family members, including those living abroad, so they remain informed and confident about their loved one’s care.',
      },
      {
        question: 'Which areas does Mekin Home Based Care serve?',
        answer:
          'Mekin Homecare currently serves Nairobi and the surrounding metropolitan areas, with plans to expand services across other regions in Kenya.',
      },
      {
        question: 'How do I request home based care services from Mekin?',
        answer:
          'You can request care by contacting us through our website, WhatsApp, or phone. Our team will guide you through a quick assessment and match you with the right caregiver or nurse.',
      },
    ],
  },
});

module.exports = mongoose.model('siteSettingsModel', SiteSchema);
