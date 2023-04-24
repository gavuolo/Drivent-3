import httpStatus from 'http-status';
import supertest from 'supertest';
import app, { init } from '@/app';
import { cleanDb, generateValidToken } from '../helpers';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';

import {
    createEnrollmentWithAddress,
    createPayment,
    createTicket,
    createTicketIncludesTicketType,
    createUser,
} from '../factories';
import { TicketStatus } from '@prisma/client';

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
    describe('Authorization error', async () => {
        it('Should respond with status 401 if no token is given', async () => {
            const response = await server.get('/hotels');
            expect(response.status).toBe(httpStatus.UNAUTHORIZED)
        });
        it('Should respond with 401 if given token is not valid', async () => {
            const token = faker.lorem.word();
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        })
        it('Should respond with status 401 if there is no session for given token', async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        })

    })
    //quando for válido
    describe('when token is valid', async () => {

        //404 quando não existir Enrollment
        it('should respond with status 404 when user doesnt have an enrollment yet', async () => {
            const token = await generateValidToken();
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        //404 quando não existir ticket
        it('should respond with status 404 when user doesnt have a ticket yet', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createEnrollmentWithAddress(user);
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });
        //402 quando o ticket não estiver pago
        it('should respond with status 402 when ticket is not paid', async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketIncludesTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        //402 quando ticket for remoto
        //402 quando ticket não incluir hotel
        //404 quando não existir hotel
        //200 quando tudo der certo e retornar array de objeto
    })

})