import { prisma } from '@/config';

async function findAllHotels(){
    return prisma.hotel.findMany();
}

export default { findAllHotels };