import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import hotelsService from '@/services/hotels-service'
import { PaymentRequired } from '@/errors/payment-required';
import { notFoundError } from '@/errors';

export async function getHotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { userId } = req
    try {
        const hotels = await hotelsService.allHotels(userId)
        if(hotels.length <= 0){
            throw notFoundError()
        }
        return res.status(httpStatus.OK).send(hotels);
    } catch (err) {
        next(err)
    }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { userId } = req
    const hotelId = Number(req.params.hotelId)
    try {
        const hotelRooms = await hotelsService.hotelById(userId, hotelId)
        return res.status(httpStatus.OK).send(hotelRooms)
    } catch (err) {
        console.log(err.name)
        next(err)
    }
}