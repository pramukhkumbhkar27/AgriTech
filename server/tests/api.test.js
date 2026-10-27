const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

let farmerToken = '';
let adminToken = '';
let createdFarmId = '';
let createdCropId = '';

test.before(async () => {
  process.env.USE_MEMORY_DB = 'true';
  process.env.NODE_ENV = 'test';
  await connectDB();

  // Seed test admin
  await User.deleteMany({});
  await Product.deleteMany({});

  await User.create({
    name: 'Admin Test',
    email: 'admin@agritech.com',
    password: 'AdminPassword123!',
    role: 'admin',
  });

  await Product.create({
    name: 'Certified Cotton Seeds',
    category: 'Seeds',
    description: 'High-yield cotton seeds',
    price: 850,
    unit: 'packet',
    stockQuantity: 50,
  });
});

test.after(async () => {
  await disconnectDB();
});

test('GET /api/health - Health check endpoint should return 200 OK', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.status, 'OK');
  assert.strictEqual(res.body.service, 'Agri-Tech Smart Farming Management System API');
});

test('POST /api/auth/register - Register a new farmer', async () => {
  const uniqueEmail = `testfarmer_${Date.now()}@agritech.com`;
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test Farmer User',
    email: uniqueEmail,
    password: 'Password123!',
    role: 'farmer',
    phone: '9988776655',
  });

  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.token);
  assert.strictEqual(res.body.user.role, 'farmer');
  farmerToken = res.body.token;
});

test('POST /api/auth/login - Login as seeded admin', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@agritech.com',
    password: 'AdminPassword123!',
  });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.token);
  assert.strictEqual(res.body.user.role, 'admin');
  adminToken = res.body.token;
});

test('GET /api/auth/me - Protected route access with JWT', async () => {
  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${farmerToken}`);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.user.name, 'Test Farmer User');
});

test('POST /api/farms - Create a new farm for authenticated farmer', async () => {
  const res = await request(app)
    .post('/api/farms')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({
      name: 'Sunlight Organic Valley',
      location: {
        city: 'Pune',
        state: 'Maharashtra',
        address: 'Plot 88, Khed',
      },
      totalArea: 10.5,
      areaUnit: 'acres',
      soilType: 'Loamy',
      irrigationType: 'Drip',
      description: 'Test drip-irrigated plot',
    });

  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.farm._id);
  createdFarmId = res.body.farm._id;
});

test('GET /api/farms - Farmer can fetch their farms', async () => {
  const res = await request(app)
    .get('/api/farms')
    .set('Authorization', `Bearer ${farmerToken}`);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.farms.length >= 1);
  assert.strictEqual(res.body.farms[0].name, 'Sunlight Organic Valley');
});

test('POST /api/crops - Add crop to farm', async () => {
  const res = await request(app)
    .post('/api/crops')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({
      farm: createdFarmId,
      name: 'Wheat (गेहूं)',
      variety: 'HD-2967',
      category: 'Cereal',
      season: 'Rabi',
      fieldPlot: 'Plot 1',
      plantingDate: '2026-11-01',
      expectedHarvestDate: '2027-03-30',
      growthStage: 'Germination',
      healthStatus: 'Good',
    });

  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.crop._id);
  createdCropId = res.body.crop._id;
});

test('POST /api/soil - Submit soil test and verify automated agronomic interpretation', async () => {
  const res = await request(app)
    .post('/api/soil')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({
      farm: createdFarmId,
      ph: 7.0,
      nitrogen: 180,
      phosphorus: 25,
      potassium: 200,
      moisture: 26,
      organicMatter: 1.6,
      plotIdentifier: 'Plot 1',
    });

  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.soilTest.interpretation.phStatus, 'Optimal / Neutral');
  assert.strictEqual(res.body.soilTest.interpretation.nitrogenStatus, 'Sufficient');
  assert.ok(res.body.soilTest.recommendations.length > 0);
});

test('GET /api/weather - Query weather with fallback / real API', async () => {
  const res = await request(app).get('/api/weather?location=Pune');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.weather.temperature);
  assert.ok(res.body.weather.forecast.length >= 5);
  assert.ok(res.body.weather.precautions.length > 0);
});

test('GET /api/products - Marketplace product list & search', async () => {
  const res = await request(app).get('/api/products?search=Cotton');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.products.length >= 1);
});

test('POST /api/orders - Demo order workflow with price/stock validation', async () => {
  const productsRes = await request(app).get('/api/products');
  const testProduct = productsRes.body.products[0];

  const res = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({
      items: [
        {
          productId: testProduct._id,
          quantity: 2,
        },
      ],
      shippingAddress: {
        fullName: 'Test Farmer',
        phone: '9988776655',
        address: 'Field Road 1',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411001',
      },
    });

  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.order.isDemoOrder, true);
  assert.strictEqual(res.body.order.items[0].price, testProduct.price);
});

test('GET /api/admin/users - Admin role authorization check', async () => {
  // Farmer attempt should fail with 403 Forbidden
  const forbiddenRes = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${farmerToken}`);
  assert.strictEqual(forbiddenRes.statusCode, 403);

  // Admin attempt should succeed with 200 OK
  const adminRes = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.strictEqual(adminRes.statusCode, 200);
  assert.strictEqual(adminRes.body.success, true);
  assert.ok(adminRes.body.users.length > 0);
});
