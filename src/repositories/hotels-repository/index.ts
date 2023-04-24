import { prisma } from "@/config";

async function findAllHotels() {
  return prisma.hotel.findMany();
}
async function findHotel(hotelId: number) {
  return prisma.hotel.findFirst({
    where: { id: hotelId },
    include: { Rooms: true },
  });
}
export default { findAllHotels, findHotel };
