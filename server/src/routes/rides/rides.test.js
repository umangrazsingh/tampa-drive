const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env'), quiet: true });

const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadDestinations } = require('../../models/destinations.model');
const { syncMembers } = require('../../models/members.model');
const rides = require('../../models/rides.mongo');

// Tests use the separate "tampadrive_test" database (see services/mongo.js)
const CODE = process.env.INVITE_CODE;
const inTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

describe('Rides API', () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadDestinations();
    await syncMembers();
    await rides.deleteMany({}); // start every test run with no rides
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Invite code', () => {
    test('It should block requests without the invite code', async () => {
      await request(app).get('/rides').expect(401);
    });

    test('It should reject a wrong code on POST /session', async () => {
      await request(app).post('/session').send({ inviteCode: 'nope' }).expect(401);
    });

    test('It should return members for the right code', async () => {
      const response = await request(app)
        .post('/session')
        .send({ inviteCode: CODE })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(Array.isArray(response.body.members)).toBe(true);
    });
  });

  describe('Test GET /destinations', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get('/destinations')
        .set('x-invite-code', CODE)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body[0]).toHaveProperty('driveMinutes');
    });
  });

  describe('Test POST /rides', () => {
    const completeRide = {
      destination: 'TPA Airport',
      departure: inTwoDays,
      seats: 2,
      driver: 'Aarav',
      note: 'Test ride',
    };

    test('It should respond with 201 created', async () => {
      const response = await request(app)
        .post('/rides')
        .set('x-invite-code', CODE)
        .send(completeRide)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toMatchObject({
        destination: 'TPA Airport',
        driveMinutes: 25,
        seats: 2,
        seatsLeft: 2,
        driver: 'Aarav',
        status: 'upcoming',
      });
      expect(new Date(response.body.departure).valueOf()).toBe(new Date(inTwoDays).valueOf());
    });

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/rides')
        .set('x-invite-code', CODE)
        .send({ destination: 'Walmart' })
        .expect(400);
      expect(response.body).toStrictEqual({ error: 'Missing required ride property' });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/rides')
        .set('x-invite-code', CODE)
        .send({ ...completeRide, departure: 'Siuu' })
        .expect(400);
      expect(response.body).toStrictEqual({ error: 'Invalid departure date' });
    });

    test('It should catch rides in the past', async () => {
      await request(app)
        .post('/rides')
        .set('x-invite-code', CODE)
        .send({ ...completeRide, departure: '2020-01-01T10:00:00Z' })
        .expect(400);
    });

    test('It should catch unknown destinations', async () => {
      await request(app)
        .post('/rides')
        .set('x-invite-code', CODE)
        .send({ ...completeRide, destination: 'Mars' })
        .expect(400);
    });
  });

  describe('Join, leave and cancel', () => {
    let rideNumber;

    beforeAll(async () => {
      const response = await request(app)
        .post('/rides')
        .set('x-invite-code', CODE)
        .send({ destination: 'Walmart', departure: inTwoDays, seats: 1, driver: 'Prabin' });
      rideNumber = response.body.rideNumber;
    });

    test('The driver cannot join their own ride', async () => {
      await request(app).post(`/rides/${rideNumber}/join`)
        .set('x-invite-code', CODE).send({ name: 'Prabin' }).expect(400);
    });

    test('A friend can join, and the ride becomes full', async () => {
      const response = await request(app).post(`/rides/${rideNumber}/join`)
        .set('x-invite-code', CODE).send({ name: 'Sita' }).expect(200);
      expect(response.body.riders).toEqual(['Sita']);
      expect(response.body.status).toBe('full');
    });

    test('Nobody else can join a full ride', async () => {
      const response = await request(app).post(`/rides/${rideNumber}/join`)
        .set('x-invite-code', CODE).send({ name: 'Rohan' }).expect(400);
      expect(response.body).toStrictEqual({ error: 'Ride is full' });
    });

    test('A rider can leave', async () => {
      const response = await request(app).post(`/rides/${rideNumber}/leave`)
        .set('x-invite-code', CODE).send({ name: 'Sita' }).expect(200);
      expect(response.body.riders).toEqual([]);
      expect(response.body.status).toBe('upcoming');
    });

    test('Only the driver can cancel', async () => {
      await request(app).delete(`/rides/${rideNumber}`)
        .set('x-invite-code', CODE).send({ name: 'Sita' }).expect(403);
    });

    test('Cancelling moves the ride to history', async () => {
      const response = await request(app).delete(`/rides/${rideNumber}`)
        .set('x-invite-code', CODE).send({ name: 'Prabin' }).expect(200);
      expect(response.body.status).toBe('cancelled');

      const history = await request(app).get('/rides?view=history')
        .set('x-invite-code', CODE).expect(200);
      expect(history.body.some((ride) => ride.rideNumber === rideNumber)).toBe(true);
    });

    test('Unknown rides return 404', async () => {
      await request(app).post('/rides/99999/join')
        .set('x-invite-code', CODE).send({ name: 'Sita' }).expect(404);
    });
  });
});
