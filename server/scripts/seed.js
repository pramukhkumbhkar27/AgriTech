require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');

const User = require('../src/models/User');
const Farm = require('../src/models/Farm');
const Crop = require('../src/models/Crop');
const CropActivity = require('../src/models/CropActivity');
const SoilTest = require('../src/models/SoilTest');
const PestAlert = require('../src/models/PestAlert');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Consultation = require('../src/models/Consultation');
const ForumPost = require('../src/models/ForumPost');
const ForumComment = require('../src/models/ForumComment');
const Notification = require('../src/models/Notification');
const { interpretSoilMetrics } = require('../src/services/soilService');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Farm.deleteMany({}),
      Crop.deleteMany({}),
      CropActivity.deleteMany({}),
      SoilTest.deleteMany({}),
      PestAlert.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Consultation.deleteMany({}),
      ForumPost.deleteMany({}),
      ForumComment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    // Note: User.pre('save') will hash passwords automatically
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

    console.log('[Seed] Creating demo farms...');
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

    const farm3 = await Farm.create({
      farmer: farmer2._id,
      name: 'Golden Fields Estate',
      location: {
        address: 'GT Road East, Near Canal Bridge',
        city: 'Ludhiana',
        district: 'Ludhiana',
        state: 'Punjab',
        country: 'India',
        lat: 30.901,
        lon: 75.8573,
      },
      totalArea: 28.0,
      areaUnit: 'acres',
      soilType: 'Alluvial',
      irrigationType: 'Tube Well',
      description: 'Deep alluvial plain optimized for high-yield wheat and basmati paddy rotation with laser-leveled fields.',
    });

    console.log('[Seed] Creating demo crops...');
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
        {
          date: new Date('2026-08-20'),
          fertilizerName: 'Neem Coated Urea & Potassium Sulfate',
          quantity: '35 kg/acre',
          method: 'Drip fertigation',
          notes: 'Peak squaring stage nutrient boost.',
        },
      ],
      expectedYield: { amount: 18, unit: 'Quintals/acre' },
      notes: 'Healthy boll retention. No major infestation observed so far.',
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
        notes: 'In-line drippers with automated pressure regulation.',
      },
      fertilizerRecords: [
        {
          date: new Date('2026-09-02'),
          fertilizerName: '19:19:19 NPK Water Soluble',
          quantity: '5 kg/acre',
          method: 'Fertigation',
          notes: 'Weekly vegetative booster.',
        },
      ],
      expectedYield: { amount: 350, unit: 'Quintals' },
      notes: 'Abundant flowering. Yellow sticky traps installed for whitefly monitoring.',
      status: 'Active',
    });

    const crop3 = await Crop.create({
      farmer: farmer1._id,
      farm: farm2._id,
      name: 'Pomegranate (अनार)',
      variety: 'Bhagawa',
      category: 'Fruit',
      season: 'Year-Round',
      fieldPlot: 'Orchard Block 1',
      areaAllocated: 5.0,
      areaUnit: 'acres',
      plantingDate: new Date('2024-03-01'),
      expectedHarvestDate: new Date('2026-12-10'),
      growthStage: 'Fruiting',
      growthProgressPercentage: 85,
      healthStatus: 'Excellent',
      irrigationSchedule: {
        frequencyDays: 4,
        lastIrrigatedDate: new Date('2026-10-23'),
        nextIrrigationDate: new Date('2026-10-27'),
        waterSource: 'Micro-Sprinkler',
      },
      fertilizerRecords: [
        {
          date: new Date('2026-07-15'),
          fertilizerName: 'Well-Rotted Farmyard Manure & Vermicompost',
          quantity: '10 tons/ha',
          method: 'Basin ring placement',
          notes: 'Monsoon root feeder application.',
        },
      ],
      expectedYield: { amount: 80, unit: 'Quintals' },
      notes: 'Lush fruit coloring with high TSS sugar content developing.',
      status: 'Active',
    });

    const crop4 = await Crop.create({
      farmer: farmer2._id,
      farm: farm3._id,
      name: 'Wheat (गेहूं)',
      variety: 'HD-3086 (Pusa Gautami)',
      category: 'Cereal',
      season: 'Rabi',
      fieldPlot: 'Northern Quad A',
      areaAllocated: 15.0,
      areaUnit: 'acres',
      plantingDate: new Date('2026-10-20'),
      expectedHarvestDate: new Date('2027-04-10'),
      growthStage: 'Germination',
      growthProgressPercentage: 15,
      healthStatus: 'Excellent',
      irrigationSchedule: {
        frequencyDays: 14,
        lastIrrigatedDate: new Date('2026-10-20'),
        nextIrrigationDate: new Date('2026-11-10'),
        waterSource: 'Canal & Tube Well',
        notes: 'Pre-sowing irrigation completed. Crown root initiation watering scheduled.',
      },
      fertilizerRecords: [
        {
          date: new Date('2026-10-20'),
          fertilizerName: 'DAP & Zinc Sulfate',
          quantity: '55 kg/acre',
          method: 'Seed-cum-fertilizer drill',
          notes: 'Basal placement at 5 cm depth.',
        },
      ],
      expectedYield: { amount: 24, unit: 'Quintals/acre' },
      status: 'Active',
    });

    console.log('[Seed] Creating crop activities / calendar reminders...');
    await CropActivity.create([
      {
        farmer: farmer1._id,
        farm: farm1._id,
        crop: crop1._id,
        title: 'Boll Development Fertigation & Calcium Spray',
        activityType: 'Fertilization',
        scheduledDate: new Date(Date.now() + 1 * 86400000), // tomorrow
        status: 'Pending',
        priority: 'High',
        notes: 'Foliar application of 13:00:45 potassium nitrate and chelated calcium to prevent fruit dropping.',
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
        notes: 'Clean disc filters to maintain 1.5 kg/cm2 uniform emitter discharge.',
      },
      {
        farmer: farmer1._id,
        farm: farm1._id,
        crop: crop1._id,
        title: 'Pheromone Trap Lure Replacement (Pink Bollworm)',
        activityType: 'Scouting',
        scheduledDate: new Date(Date.now() + 4 * 86400000),
        status: 'Pending',
        priority: 'High',
        notes: 'Inspect moth counts across 8 field traps.',
      },
      {
        farmer: farmer1._id,
        farm: farm2._id,
        crop: crop3._id,
        title: 'Pre-Harvest Fruit Bagging Inspection',
        activityType: 'Scouting',
        scheduledDate: new Date(Date.now() + 6 * 86400000),
        status: 'Pending',
        priority: 'Medium',
        notes: 'Check protective butter paper bags against sunburn and fruit borer.',
      },
    ]);

    console.log('[Seed] Creating soil test records...');
    const soilAnalysis1 = interpretSoilMetrics({
      ph: 7.2,
      nitrogen: 195,
      phosphorus: 24,
      potassium: 210,
      moisture: 28,
      organicMatter: 1.8,
    });

    const soilAnalysis2 = interpretSoilMetrics({
      ph: 5.8,
      nitrogen: 125,
      phosphorus: 12,
      potassium: 160,
      moisture: 22,
      organicMatter: 1.1,
    });

    await SoilTest.create([
      {
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
      },
      {
        farmer: farmer1._id,
        farm: farm2._id,
        sampleCollectionDate: new Date('2026-09-28'),
        plotIdentifier: 'Orchard Block 1',
        soilType: 'Red',
        ph: 5.8,
        nitrogen: 125,
        phosphorus: 12,
        potassium: 160,
        moisture: 22,
        organicMatter: 1.1,
        dataSource: 'Manual Farmer Entry',
        interpretation: soilAnalysis2.interpretation,
        recommendations: soilAnalysis2.recommendations,
        notes: 'Slightly acidic red soil. Recommended application of agricultural lime before winter.',
      },
    ]);

    console.log('[Seed] Creating pest and disease alerts...');
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
        management: 'Release Trichogramma bactrae egg parasitoids @ 1.5 lakh/ha. Spray Azadirachtin (neem oil) 1500 ppm @ 5 ml/L, or Chlorantraniliprole 18.5% SC @ 0.3 ml/L under expert consultation.',
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
        symptoms: 'Pin-hole feeding marks on whorl leaves, extensive window pane skeletonization, and coarse sawdust-like frass in leaf whorls.',
        severity: 'High',
        affectedRegion: 'Central & Southern Maharashtra',
        prevention: 'Deep summer ploughing to expose pupae to solar heat and predatory birds. Intercrop with cowpea or pigeonpea.',
        management: 'Apply sand mixed with neem seed powder (9:1) into leaf whorls. Biological spray of Bacillus thuringiensis (Bt) @ 2 g/L during early instar stage.',
        status: 'New',
        isVerifiedAdvisory: true,
        verifiedBy: expert1._id,
        isSampleContent: true,
      },
      {
        creator: farmer1._id,
        pestName: 'Tomato Leaf Curl Virus (लीफ कर्ल वायरस)',
        scientificName: 'Begomovirus',
        cropAffected: 'Tomato',
        symptoms: 'Upward curling and crinkling of leaves, stunted plant height, interveinal chlorosis, and reduced fruit setting.',
        severity: 'Medium',
        affectedRegion: 'Pune Rural District',
        farm: farm1._id,
        prevention: 'Erect yellow sticky cards (15-20/acre) to trap whitefly vectors. Use insect-proof 40-mesh nursery nets.',
        management: 'Remove and destroy virus-infected plants immediately. Spray Imidacloprid 17.8% SL @ 0.4 ml/L or neem formulation to control whitefly vector.',
        status: 'New',
        isVerifiedAdvisory: false,
        isSampleContent: false,
      },
      {
        creator: expert2._id,
        pestName: 'Yellow / Stripe Rust (पीला रतुआ)',
        scientificName: 'Puccinia striiformis',
        cropAffected: 'Wheat',
        symptoms: 'Yellow stripe-like pustules arranged linearly along leaf veins. Yellowish-orange powdery spores stain fingers upon touch.',
        severity: 'High',
        affectedRegion: 'North-Western Plains (Punjab, Haryana)',
        prevention: 'Cultivate rust-resistant varieties like HD-3086 or PBW-550. Avoid late sowing.',
        management: 'At initial pustule detection, spray Propiconazole 25% EC @ 1 ml/L or Tebuconazole 250 EC @ 1 ml/L in 200 L water per acre.',
        status: 'New',
        isVerifiedAdvisory: true,
        verifiedBy: expert2._id,
        isSampleContent: true,
      },
    ]);

    console.log('[Seed] Creating marketplace catalog products...');
    const products = await Product.create([
      {
        name: 'Certified Hybrid Cotton Seeds BG-II',
        category: 'Seeds',
        description: 'High-yielding, drought-tolerant Bt-Cotton seeds with superior boll retention and high ginning outturn. Treated with biological fungicide.',
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
        description: 'Rich in earthworm castings, humic acid, and beneficial soil microbes. Enriches carbon content and optimizes soil water retention capacity.',
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
        description: 'Imported water-soluble fertilizer specifically formulated for drip fertigation and foliar spray. Rapidly absorbed with zero residue.',
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
        description: 'Comprehensive 1-acre kit including inline drip tubes, disc filter, venturi injector, pressure regulator, and solar timer valve.',
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
        description: 'Certified organic broad-spectrum biopesticide and insect growth regulator. Repels aphids, jassids, caterpillars, and whiteflies effectively.',
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
        description: 'Heavy-duty 12V 12Ah lithium battery sprayer with dual speed regulator, extendable stainless steel lance, and 4 specialized nozzles.',
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
      {
        name: 'Pheromone Trap + Lure Kit for Pink Bollworm (Pack of 5)',
        category: 'Crop Protection Products',
        description: 'Ecologically safe monitoring and mass-trapping tool. High-attractant synthetic pheromone lures last up to 45 days in open fields.',
        price: 450,
        originalPrice: 550,
        unit: 'Pack of 5 units',
        stockQuantity: 50,
        imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
        brand: 'BioTrap Tech',
        isOrganic: true,
        rating: 4.8,
        reviewsCount: 15,
      },
      {
        name: 'Premium High-Yield Hybrid Tomato Seeds (Arka Rakshak)',
        category: 'Seeds',
        description: 'Triple-disease resistant hybrid developed by IIHR. Resistant to ToLCV, Early Blight, and Bacterial Wilt. Excellent firmness for transport.',
        price: 320,
        originalPrice: 390,
        unit: '10g packet',
        stockQuantity: 70,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
        brand: 'Indo-American Seeds',
        isOrganic: false,
        rating: 4.9,
        reviewsCount: 23,
      },
    ]);

    console.log('[Seed] Creating demo order...');
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
        {
          product: products[4]._id,
          name: products[4].name,
          price: products[4].price,
          quantity: 1,
          imageUrl: products[4].imageUrl,
          unit: products[4].unit,
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
      subtotal: 1660,
      shippingFee: 0,
      totalAmount: 1660,
      isDemoOrder: true,
      trackingNote: 'Consignment successfully delivered by regional Agri-Tech delivery partner.',
    });

    console.log('[Seed] Creating consultations...');
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
          {
            status: 'Pending',
            changedAt: new Date('2026-10-25'),
            comment: 'Request submitted.',
            changedBy: farmer1._id,
          },
          {
            status: 'Accepted',
            changedAt: new Date('2026-10-26'),
            comment: 'Accepted. Will provide detailed micronutrient recipe.',
            changedBy: expert1._id,
          },
        ],
      },
      {
        farmer: farmer1._id,
        expert: expert2._id,
        farm: farm1._id,
        cropName: 'Tomato',
        topic: 'Crop Health & Disease',
        urgency: 'High',
        preferredDate: new Date('2026-10-22'),
        problemDescription: 'Noticed leaf curling and yellow veins on 10-15 plants in the polyhouse. Need diagnosis and vector management protocol.',
        status: 'Completed',
        expertResponse: {
          diagnosis: 'Symptoms indicate early Tomato Leaf Curl Virus (ToLCV) transmitted by Bemisia tabaci (whitefly).',
          advice: 'Immediately rogue out severely deformed plants and bury them. Spray combination of neem oil (5ml/L) + yellow sticky traps to curb whitefly proliferation without destroying beneficial pollinator bees.',
          suggestedTreatments: [
            'Install yellow sticky traps (20 per acre) at canopy height',
            'Spray Azadirachtin 10,000 ppm @ 2 ml/L early morning',
            'Foliar spray of zinc sulphate 0.5% + borax 0.2% to boost plant vigor',
          ],
          respondedAt: new Date('2026-10-23'),
        },
        statusHistory: [
          { status: 'Pending', changedAt: new Date('2026-10-22'), changedBy: farmer1._id },
          { status: 'Accepted', changedAt: new Date('2026-10-22'), changedBy: expert2._id },
          { status: 'Completed', changedAt: new Date('2026-10-23'), changedBy: expert2._id },
        ],
      },
    ]);

    console.log('[Seed] Creating forum discussions...');
    const post1 = await ForumPost.create({
      author: expert1._id,
      title: 'Guide: Drip Fertigation Schedules for Rabi Wheat and Cereals',
      category: 'Crops & Soil',
      content: 'Proper fertigation timing can increase nitrogen use efficiency from 35% to over 65%. Here is the optimal split schedule: 20% basal, 40% at tillering via drip lines, and 40% at heading stage. Avoid excessive urea right before heavy rainfall.',
      tags: ['Wheat', 'Fertigation', 'SoilHealth', 'RabiSeason'],
      viewsCount: 142,
      isPinned: true,
    });

    const post2 = await ForumPost.create({
      author: farmer1._id,
      title: 'How I successfully managed Pink Bollworm in Bt-Cotton with Pheromone Traps',
      category: 'Pest Control',
      content: 'Sharing my experience from Baramati: By setting up 8 sleeve traps per acre right from 40 days after germination and monitoring the moth catch threshold (8 moths/trap/night for 3 consecutive days), I saved 3 expensive chemical spray rounds!',
      tags: ['Cotton', 'IPM', 'PheromoneTraps', 'FarmerExperience'],
      viewsCount: 89,
    });

    await ForumComment.create([
      {
        post: post2._id,
        author: expert2._id,
        content: 'Commendable effort, Ramesh ji! Pheromone trapping is the cornerstone of economic threshold level (ETL) management. Keep replacing lures every 40-45 days.',
      },
      {
        post: post2._id,
        author: farmer2._id,
        content: 'Very insightful! Did you observe any damage on the peripheral border rows?',
      },
    ]);

    console.log('[Seed] Creating notifications...');
    await Notification.create([
      {
        recipient: farmer1._id,
        title: 'Irrigation Advisory for Cotton',
        message: 'Upcoming weather indicates warm sunny days. Run drip cycle for Sector A-1 tomorrow morning.',
        type: 'Irrigation',
        link: '/crops',
      },
      {
        recipient: farmer1._id,
        title: 'Expert Dr. Sunita Patel Replied',
        message: 'Your tomato consultation request has been answered with full treatment recommendations.',
        type: 'Consultation',
        link: '/consultations',
      },
      {
        recipient: farmer1._id,
        title: 'Regional Pest Alert: Pink Bollworm',
        message: 'Critical advisory issued for cotton growers in Pune & Vidarbha regions.',
        type: 'PestAlert',
        link: '/pest-alerts',
      },
    ]);

    console.log('===========================================================');
    console.log('  ✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log('===========================================================');
    console.log('  Demo Logins:');
    console.log('  👨‍🌾 Farmer:  farmer@agritech.com      / FarmerPassword123!');
    console.log('  👩‍🌾 Farmer 2: priya.farmer@agritech.com / FarmerPassword123!');
    console.log('  🔬 Expert:  expert@agritech.com      / ExpertPassword123!');
    console.log('  🛡️ Admin:   admin@agritech.com       / AdminPassword123!');
    console.log('===========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
