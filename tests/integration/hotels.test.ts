// import httpStatus from 'http-status';
// import supertest from 'supertest';
// import app, { init } from '@/app';
// import { cleanDb } from '../helpers';

// beforeAll(async () => {
//     await init();
// });

// beforeEach(async () => {
//     await cleanDb();
// });

// const server = supertest(app);

// describe('GET /hotels', () => {
//     it('Buscar todos os hoteis', async () => {
//       const response = await server.get('/hotel');
//       expect(response.status).toBe(200)
//     });
// })