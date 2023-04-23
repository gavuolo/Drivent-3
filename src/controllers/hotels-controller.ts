import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import hotelsService from '@/services/hotels-service'

export async function getHotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { userId } = req
    try {
        const hotels = await hotelsService.allHotels(userId)
        return res.status(httpStatus.OK).send(hotels);
    } catch (err) {
        next(err)
    }
} 