import httpStatus from 'http-status';
import supertest from 'supertest';
import app, { init } from '@/app';
import { cleanDb } from '../helpers';

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
    it('Should respond with status 401 if no token is given', async () => {
      const response = await server.get('/hotels');
      expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    });
})