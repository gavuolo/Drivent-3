import { notFoundError } from '@/errors';
import { PaymentRequired } from '@/errors/payment-required';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import { Ticket, TicketType } from '@prisma/client';

async function allHotels(userId: number){
    const ticket = await checkEnrollmentAndTicket(userId)
    await checkTicketType(ticket)
    await checkPaymentStatus(ticket)
    const hotels = await hotelsRepository.findAllHotels()
    if(hotels.length <= 0){
        throw notFoundError()
    }
    return hotels
}
async function checkPaymentStatus(ticket: Ticket & {TicketType:TicketType}){
    if (ticket.status !== 'PAID') {
        throw PaymentRequired()
    }
}
async function checkTicketType(ticket: Ticket & {TicketType:TicketType}) {
    if (!ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
        throw PaymentRequired()
    }
}
async function checkEnrollmentAndTicket(userId: number): Promise<Ticket & {TicketType: TicketType}>{
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId)
    if(!enrollment) {
        throw notFoundError()
    }
    const enrollmentId = enrollment.id
    const ticket: Ticket & {TicketType: TicketType} = await ticketsRepository.findTicketByEnrollmentId(enrollmentId)
    if(!ticket) {
        throw notFoundError()
    }
    return ticket
}
async function hotelById(userId: number, hotelId: number){
    const ticket = await checkEnrollmentAndTicket(userId)
    await checkTicketType(ticket)
    await checkPaymentStatus(ticket)
    const hotelRooms = await hotelsRepository.findHotel(hotelId)
    if(!hotelRooms){
        throw notFoundError()
    }
    return hotelRooms 

}
export default {
    allHotels,
    hotelById
};