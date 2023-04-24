import httpStatus from "http-status";
import supertest from "supertest";
import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";

import {
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketTypeParameter,
  createTicketIncludesTicketType,
  createTicketType,
  createUser,
} from "../factories";
import { TicketStatus } from "@prisma/client";
import { createHotel, createRoom } from "../factories/hotels-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  describe("Authorization errors", () => {
    it("Should respond with status 401 if no token is given", async () => {
      const response = await server.get("/hotels");
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it("Should respond with 401 if given token is not valid", async () => {
      const token = faker.lorem.word();
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it("Should respond with status 401 if there is no session for given token", async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign(
        { userId: userWithoutSession.id },
        process.env.JWT_SECRET
      );
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });
  //quando for válido
  describe("when token is valid", () => {
    //404 quando não existir Enrollment
    it("Should respond with status 404 when user doesnt have an enrollment yet", async () => {
      const token = await generateValidToken();
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    //404 quando não existir ticket
    it("Should respond with status 404 when user doesnt have a ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    //402 quando o ticket não estiver pago
    it("Should respond with status 402 when ticket is not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketIncludesTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    //402 quando ticket for remoto e não incluir hotel
    it("Should respond with status 402 when ticket is remote and not includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = true;
      const includesHotel = false;
      const ticketRemote = await createTicketTypeParameter(
        isRemote,
        includesHotel
      );
      await createTicket(enrollment.id, ticketRemote.id, TicketStatus.PAID);
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    //404 quando não existir hotel
    //200 quando tudo der certo e retornar array de objeto
    it("Should respond with status 200 with hotels list", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketTypeParameter(
        isRemote,
        includesHotel
      );
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotel();
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ])
      );
    });
  });
});

describe("GET /hotels/:hotelsId", () => {
  describe("Authorization errors", () => {
    it("Should respond with status 401 if no token is given", async () => {
      const response = await server.get("/hotels");
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it("Should respond with 401 if given token is not valid", async () => {
      const token = faker.lorem.word();
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it("Should respond with status 401 if there is no session for given token", async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign(
        { userId: userWithoutSession.id },
        process.env.JWT_SECRET
      );
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });
  //quando for válido
  describe("when token is valid", () => {
    //404 quando não existir Enrollment
    it("Should respond with status 404 when user doesnt have an enrollment yet", async () => {
      const token = await generateValidToken();
      const response = await server
        .get("/hotels/1")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    //404 quando não existir ticket
    it("Should respond with status 404 when user doesnt have a ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const response = await server
        .get("/hotels/1")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    //402 quando o ticket não estiver pago
    it("Should respond with status 402 when ticket is not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketTypeParameter(
        isRemote,
        includesHotel
      );
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createHotel();
      const response = await server
        .get("/hotels/1")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    //402 quando ticket for remoto e não incluir hotel
    it("Should respond with status 402 when ticket is remote and not includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = true;
      const includesHotel = false;
      const ticketRemote = await createTicketTypeParameter(
        isRemote,
        includesHotel
      );
      await createTicket(enrollment.id, ticketRemote.id, TicketStatus.PAID);
      const response = await server
        .get("/hotels/1")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    //404 não existir hotel
    //retornou tudo ok
    it("Should respond with status 200 with array hotel rooms", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = false;
      const includesHotel = true;
      const ticketRemote = await createTicketTypeParameter(
        isRemote,
        includesHotel
      );
      await createTicket(enrollment.id, ticketRemote.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const hotelRoom = await createRoom(hotel.id);
      const response = await server
        .get(`/hotels/${hotelRoom.id}`)
        .set("Authorization", `Bearer ${token}`);

        console.log(response.body)
        console.log(hotel)
        console.log(hotelRoom)
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
            Rooms: [
              {
                id: hotelRoom.id,
                name: hotelRoom.name,
                capacity: hotelRoom.capacity,
                hotelId: hotelRoom.id,
                createdAt: hotelRoom.createdAt.toISOString(),
                updatedAt: hotelRoom.updatedAt.toISOString(),
              },
            ],
          }),
        ])
      );
    });
  });
});

// expect(response.body).toEqual(expect.objectContaining({
//   id: hotel.id,
//   name: hotel.name,
//   image: hotel.image,
//   createdAt: hotel.createdAt.toISOString(),
//   updatedAt: hotel.updatedAt.toISOString(),
//   Rooms: [{
//     id: hotelRoom.id,
//      name: hotelRoom.name,
//     capacity: hotelRoom.capacity,
//     hotelId: hotelRoom.id,
//     createdAt: hotelRoom.createdAt.toISOString(),
//      updatedAt: hotelRoom.updatedAt.toISOString(),
//   }]
// }))
