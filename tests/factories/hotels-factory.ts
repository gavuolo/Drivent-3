import faker from '@faker-js/faker';
import { prisma } from '@/config';

export function createHotel(){
    return prisma.hotel.create({
        data:{
            name: faker.name.findName(),
            image: faker.image.abstract(),
        }
    })
}

export function createRoom(hotelId: number){
    return prisma.room.create({
        data:{
            name: faker.name.findName(),
            capacity: faker.datatype.number({min: 0, max:10}),
            hotelId: hotelId
        }
    })
}