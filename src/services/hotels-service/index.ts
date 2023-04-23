import { notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import { Ticket, TicketType } from '@prisma/client';

async function allHotels(userId: number){
    const ticket = await checkEnrollmentAndTicket(userId)

    await checkTicketType(ticket)
    await checkPaymentStatus(ticket)
    
    const hotels = await hotelsRepository.findAllHotels()
    console.log(hotels)
    return hotels
}
async function checkPaymentStatus(ticket: Ticket & {TicketType:TicketType}){
    if (ticket.status !== 'PAID') {
        throw new Error('The ticket has not yet been paid') 
    }
}
async function checkTicketType(ticket: Ticket & {TicketType:TicketType}) {
    if (!ticket.TicketType.includesHotel) {
        throw new Error('Ticket type does not include hotel') 
    }
}
async function checkEnrollmentAndTicket(userId: number): Promise<Ticket & {TicketType: TicketType}>{
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId)
    if(!enrollment) {
        throw notFoundError
    }
    const enrollmentId = enrollment.id
    const ticket: Ticket & {TicketType: TicketType} = await ticketsRepository.findTicketByEnrollmentId(enrollmentId)
    if(!ticket) {
        throw notFoundError
    }
    return ticket
}
export default {
    allHotels
};