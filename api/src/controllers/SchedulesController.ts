import { NextFunction, Request, Response } from "express";
import { SchedulesService } from "../services/SchedulesServices";
import { parseISO } from "date-fns";

class SchedulesController{
    private schedulesService: SchedulesService
    constructor(){
        this.schedulesService = new SchedulesService()
    }
    async store(request: Request, response: Response, next: NextFunction){
        const { name, phone, date } = request.body
        try {
            const result = await this.schedulesService.create({name, phone, date});

            return response.status(201).json(result);
        } catch (error) {
            next(error)
        }
    }
    async index(request: Request, response: Response, next: NextFunction){
        //localhost:3000/schedules?date=
        const { date } = request.query;
        const parseDate = date ? parseISO(date.toString()) : new Date();
        try {
            const result = await this.schedulesService.index(parseDate);
            return response.json(result);
        } catch (error) {
            next(error);
        }
    }
    async update(request: Request, response: Response, next: NextFunction){
        const {id} = request.params;
        const {date} = request.body;
        try {
            const result = await this.schedulesService.update(id, date);
            return response.json(result);
        } catch (error) {
            next(error)
        }
    }
    delete(request: Request, response: Response, next: NextFunction){}
}

export { SchedulesController }