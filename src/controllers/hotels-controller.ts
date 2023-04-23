import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import hotelsService from '@/services/hotels-service'

export async function getHotels(req: AuthenticatedRequest, res: Response, next: NextFunction){
    try{

    }catch(err){
        next(err)
    }
} 