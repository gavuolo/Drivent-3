import { prisma } from '@/config';

async function findAllHotels() {
    return prisma.hotel.findMany();
}
async function findHotel(id: number) {
    return prisma.hotel.findUnique({
        where: { id }
    })
}
export default { findAllHotels, findHotel };