const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const CropActivity = require('../models/CropActivity');
const SoilTest = require('../models/SoilTest');
const PestAlert = require('../models/PestAlert');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Consultation = require('../models/Consultation');
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const Notification = require('../models/Notification');
const { interpretSoilMetrics } = require('../services/soilService');

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[AutoSeed] Database already has ${userCount} users. Skipping auto-seed.`);
      return;
    }

    console.log('[AutoSeed] Database is empty. Seeding initial demo data...');

    const adminUser = await User.create({
      name: 'Agri-Tech System Administrator',
      email: 'admin@agritech.com',
      password: 'AdminPassword123!',
      role: 'admin',
      phone: '+91 9876543210',
      address: 'Central Agritech Tower, Innovation Hub',
      location: { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
      bio: 'Platform administrator overseeing users, inventory, forum moderation, and regional advisory systems.',
    });

    const farmer1 = await User.create({
      name: 'Ramesh Patil',
      email: 'farmer@agritech.com',
      password: 'FarmerPassword123!',
      role: 'farmer',
      phone: '+91 9822012345',
      address: 'Plot 42, Shivraj Nagar, Baramati',
      location: { city: 'Pune', state: 'Maharashtra', pincode: '413102' },
      bio: 'Progressive farmer practicing precision agriculture, drip fertigation, and multi-crop rotation.',
    });

    const farmer2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.farmer@agritech.com',
      password: 'FarmerPassword123!',
      role: 'farmer',
      phone: '+91 9417012345',
      address: 'Kisan Vihar, GT Road',
      location: { city: 'Ludhiana', state: 'Punjab', pincode: '141001' },
      bio: 'Cereal grain and pulse producer focused on zero-tillage wheat and organic soil management.',
    });

    const expert1 = await User.create({
      name: 'Dr. Anand Sharma',
      email: 'expert@agritech.com',
      password: 'ExpertPassword123!',
      role: 'expert',
      phone: '+91 9890012345',
      address: 'Faculty of Agronomy, Agricultural University',
      location: { city: 'Pune', state: 'Maharashtra', pincode: '411005' },
      specialization: 'Crop Nutrition, Soil Chemistry & Precision Irrigation',
      experienceYears: 16,
      languages: ['English', 'Hindi', 'Marathi'],
      bio: 'Senior Agronomist and Soil Scientist specializing in soil fertility rejuvenation, balanced fertigation, and abiotic stress management.',
    });

    const expert2 = await User.create({
      name: 'Dr. Sunita Patel',
      email: 'dr.patel@agritech.com',
      password: 'ExpertPassword123!',
      role: 'expert',
      phone: '+91 9879012345',
      address: 'Plant Pathology Division, ICAR Research Complex',
      location: { city: 'Nagpur', state: 'Maharashtra', pincode: '440010' },
      specialization: 'Integrated Pest Management (IPM) & Plant Pathology',
      experienceYears: 12,
      languages: ['English', 'Hindi', 'Gujarati'],
      bio: 'Plant protection specialist providing biological pest controls, bio-fungicide formulations, and early warning diagnostic protocols.',
    });

    const farm1 = await Farm.create({
      farmer: farmer1._id,
      name: 'Green Valley Agro Farm',
      location: {
        address: 'Gat No. 128, Rui Shivar',
        city: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        lat: 18.5204,
        lon: 73.8567,
      },
      totalArea: 14.5,
      areaUnit: 'acres',
      soilType: 'Black',
      irrigationType: 'Drip',
      description: 'Fertile black cotton soil equipped with automated drip fertigation, weather monitoring, and multi-crop zoning.',
    });

    const farm2 = await Farm.create({
      farmer: farmer1._id,
      name: 'Sahyadri Organic Orchard',
      location: {
        address: 'Survey No. 54, Dindori Valley',
        city: 'Nashik',
        district: 'Nashik',
        state: 'Maharashtra',
        country: 'India',
        lat: 19.9975,
        lon: 73.7898,
      },
      totalArea: 8.2,
      areaUnit: 'acres',
      soilType: 'Red',
      irrigationType: 'Sprinkler',
      description: 'Hilly terraced orchard dedicated to organic pomegranate, grapes, and exotic vegetable cultivation.',
    });

    const crop1 = await Crop.create({
      farmer: farmer1._id,
      farm: farm1._id,
      name: 'Cotton (कपास)',
      variety: 'Bt-Cotton Hybrid Bollgard II',
      category: 'Commercial',
      season: 'Kharif',
      fieldPlot: 'Sector A-1 (Main Plot)',
      areaAllocated: 6.5,
      areaUnit: 'acres',
      plantingDate: new Date('2026-06-15'),
      expectedHarvestDate: new Date('2026-11-20'),
      growthStage: 'Fruiting',
      growthProgressPercentage: 75,
      healthStatus: 'Excellent',
      irrigationSchedule: {
        frequencyDays: 3,
        lastIrrigatedDate: new Date('2026-10-24'),
        nextIrrigationDate: new Date('2026-10-28'),
        waterSource: 'Drip',
        notes: 'Drip run for 2.5 hours every 3 days. Soil moisture maintained at 28-32%.',
      },
      fertilizerRecords: [
        {
          date: new Date('2026-07-05'),
          fertilizerName: 'DAP (Di-Ammonium Phosphate)',
          quantity: '50 kg/acre',
          method: 'Basal soil incorporation',
          notes: 'Applied at 20 days after germination.',
        },
      ],
      expectedYield: { amount: 18, unit: 'Quintals/acre' },
      status: 'Active',
    });

    const crop2 = await Crop.create({
      farmer: farmer1._id,
      farm: farm1._id,
      name: 'Tomato (टमाटर)',
      variety: 'Abhinav Hybrid',
      category: 'Vegetable',
      season: 'Year-Round',
      fieldPlot: 'Sector B-2 (Protected Polyhouse)',
      areaAllocated: 3.0,
      areaUnit: 'acres',
      plantingDate: new Date('2026-08-10'),
      expectedHarvestDate: new Date('2026-11-15'),
      growthStage: 'Flowering',
      growthProgressPercentage: 60,
      healthStatus: 'Good',
      irrigationSchedule: {
        frequencyDays: 2,
        lastIrrigatedDate: new Date('2026-10-25'),
        nextIrrigationDate: new Date('2026-10-27'),
        waterSource: 'Drip',
      },
      expectedYield: { amount: 350, unit: 'Quintals' },
      status: 'Active',
    });

    await CropActivity.create([
      {
        farmer: farmer1._id,
        farm: farm1._id,
        crop: crop1._id,
        title: 'Boll Development Fertigation & Calcium Spray',
        activityType: 'Fertilization',
        scheduledDate: new Date(Date.now() + 1 * 86400000),
        status: 'Pending',
        priority: 'High',
      },
      {
        farmer: farmer1._id,
        farm: farm1._id,
        crop: crop2._id,
        title: 'Drip System Pressure Flush & Filter Backwash',
        activityType: 'Irrigation',
        scheduledDate: new Date(Date.now() + 2 * 86400000),
        status: 'Pending',
        priority: 'Medium',
      },
    ]);

    const soilAnalysis1 = interpretSoilMetrics({
      ph: 7.2,
      nitrogen: 195,
      phosphorus: 24,
      potassium: 210,
      moisture: 28,
      organicMatter: 1.8,
    });

    await SoilTest.create({
      farmer: farmer1._id,
      farm: farm1._id,
      sampleCollectionDate: new Date('2026-10-15'),
      plotIdentifier: 'Sector A-1 (Main Plot)',
      soilType: 'Black',
      ph: 7.2,
      nitrogen: 195,
      phosphorus: 24,
      potassium: 210,
      moisture: 28,
      organicMatter: 1.8,
      dataSource: 'Lab Report',
      interpretation: soilAnalysis1.interpretation,
      recommendations: soilAnalysis1.recommendations,
      notes: 'Soil health card sample test verified by District Soil Testing Laboratory.',
    });

    await PestAlert.create([
      {
        creator: expert2._id,
        pestName: 'Pink Bollworm (गुलाबी सुंडी)',
        scientificName: 'Pectinophora gossypiella',
        cropAffected: 'Cotton',
        symptoms: 'Rosetted flowers, premature boll opening, damaged lint fibers, and larvae boring into developing green bolls.',
        severity: 'Critical',
        affectedRegion: 'Vidarbha & Western Maharashtra',
        prevention: 'Install 8-10 pheromone traps per hectare. Avoid monoculture and destroy crop residue post-harvest.',
        management: 'Release Trichogramma bactrae egg parasitoids @ 1.5 lakh/ha. Spray Azadirachtin (neem oil) 1500 ppm @ 5 ml/L.',
        status: 'Acknowledged',
        isVerifiedAdvisory: true,
        verifiedBy: expert2._id,
        isSampleContent: true,
      },
      {
        creator: expert1._id,
        pestName: 'Fall Armyworm (फॉल आर्मीवर्म)',
        scientificName: 'Spodoptera frugiperda',
        cropAffected: 'Maize & Sweet Corn',
        symptoms: 'Pin-hole feeding marks on whorl leaves, extensive window pane skeletonization, and coarse sawdust frass.',
        severity: 'High',
        affectedRegion: 'Central & Southern Maharashtra',
        prevention: 'Deep summer ploughing to expose pupae to solar heat and predatory birds.',
        management: 'Apply sand mixed with neem seed powder (9:1) into leaf whorls.',
        status: 'New',
        isVerifiedAdvisory: true,
        verifiedBy: expert1._id,
        isSampleContent: true,
      },
    ]);

    const products = await Product.create([
      {
        name: 'Certified Hybrid Cotton Seeds BG-II',
        category: 'Seeds',
        description: 'High-yielding, drought-tolerant Bt-Cotton seeds with superior boll retention and high ginning outturn.',
        price: 860,
        originalPrice: 950,
        unit: '450g packet',
        stockQuantity: 45,
        imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80',
        brand: 'Kisan Shakti',
        isOrganic: false,
        rating: 4.8,
        reviewsCount: 34,
      },
      {
        name: 'Pure Organic Vermicompost (Premium Grade)',
        category: 'Fertilizers',
        description: 'Rich in earthworm castings, humic acid, and beneficial soil microbes. Enriches carbon content.',
        price: 490,
        originalPrice: 600,
        unit: '50 kg bag',
        stockQuantity: 80,
        imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
        brand: 'BioDharti Organic',
        isOrganic: true,
        rating: 4.9,
        reviewsCount: 52,
      },
      {
        name: 'NPK 19:19:19 100% Water Soluble Fertilizer',
        category: 'Fertilizers',
        description: 'Imported water-soluble fertilizer specifically formulated for drip fertigation and foliar spray.',
        price: 1850,
        originalPrice: 2100,
        unit: '25 kg bag',
        stockQuantity: 30,
        imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80',
        brand: 'AgriGrow Essentials',
        isOrganic: false,
        rating: 4.7,
        reviewsCount: 19,
      },
      {
        name: 'Solar Powered Micro-Drip Irrigation Starter Kit',
        category: 'Irrigation Equipment',
        description: 'Comprehensive 1-acre kit including inline drip tubes, disc filter, venturi injector, and solar timer.',
        price: 7499,
        originalPrice: 8999,
        unit: 'Complete Kit',
        stockQuantity: 12,
        imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80',
        brand: 'JalShakti Drip',
        isOrganic: false,
        rating: 4.9,
        reviewsCount: 28,
      },
      {
        name: 'Cold-Pressed Pure Neem Oil (10,000 PPM Azadirachtin)',
        category: 'Crop Protection Products',
        description: 'Certified organic broad-spectrum biopesticide and insect growth regulator. Repels sucking pests.',
        price: 680,
        originalPrice: 799,
        unit: '1 Liter bottle',
        stockQuantity: 65,
        imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
        brand: 'NeemRaksha Organic',
        isOrganic: true,
        rating: 4.6,
        reviewsCount: 41,
      },
      {
        name: 'Battery-Operated Electric Knapsack Sprayer (16 Liters)',
        category: 'Agricultural Tools',
        description: 'Heavy-duty 12V 12Ah lithium battery sprayer with dual speed regulator and stainless steel lance.',
        price: 2890,
        originalPrice: 3450,
        unit: '1 piece',
        stockQuantity: 22,
        imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80',
        brand: 'KisanPro Machinery',
        isOrganic: false,
        rating: 4.7,
        reviewsCount: 37,
      },
    ]);

    await Order.create({
      farmer: farmer1._id,
      orderNumber: 'AGT-842910-101',
      items: [
        {
          product: products[1]._id,
          name: products[1].name,
          price: products[1].price,
          quantity: 2,
          imageUrl: products[1].imageUrl,
          unit: products[1].unit,
        },
      ],
      shippingAddress: {
        fullName: 'Ramesh Patil',
        phone: '+91 9822012345',
        address: 'Green Valley Agro Farm, Rui Shivar',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '413102',
      },
      paymentMethod: 'Demo Payment (Simulated Instant Approval)',
      paymentStatus: 'Paid (Demo)',
      orderStatus: 'Delivered',
      subtotal: 980,
      shippingFee: 99,
      totalAmount: 1079,
      isDemoOrder: true,
      trackingNote: 'Consignment successfully delivered by regional Agri-Tech delivery partner.',
    });

    await Consultation.create([
      {
        farmer: farmer1._id,
        expert: expert1._id,
        farm: farm1._id,
        cropName: 'Cotton',
        topic: 'Soil Fertility & Nutrients',
        urgency: 'Normal',
        preferredDate: new Date('2026-10-30'),
        problemDescription: 'Experiencing slight lower leaf yellowing on black cotton soil during flowering. Want advice on foliar magnesium versus nitrogen top-dressing.',
        status: 'Accepted',
        statusHistory: [
          { status: 'Pending', changedAt: new Date(), comment: 'Request submitted.', changedBy: farmer1._id },
          { status: 'Accepted', changedAt: new Date(), comment: 'Accepted by expert.', changedBy: expert1._id },
        ],
      },
    ]);

    await ForumPost.create({
      author: expert1._id,
      title: 'Guide: Drip Fertigation Schedules for Rabi Wheat and Cereals',
      category: 'Crops & Soil',
      content: 'Proper fertigation timing can increase nitrogen use efficiency from 35% to over 65%. Split schedules are essential.',
      tags: ['Wheat', 'Fertigation', 'SoilHealth'],
      viewsCount: 142,
      isPinned: true,
    });

    await Notification.create([
      {
        recipient: farmer1._id,
        title: 'Irrigation Advisory for Cotton',
        message: 'Upcoming weather indicates warm sunny days. Run drip cycle for Sector A-1 tomorrow morning.',
        type: 'Irrigation',
        link: '/crops',
      },
    ]);

    console.log('[AutoSeed] Demo data auto-seeded successfully!');
  } catch (err) {
    console.error('[AutoSeed] Error during auto-seeding:', err.message);
  }
};

module.exports = { autoSeedIfEmpty };
