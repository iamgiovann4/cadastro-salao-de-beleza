import { ICreate } from "../interfaces/SchedulesInterface";
import { getHours, isBefore, startOfHour } from 'date-fns';
import { SchedulesRepository } from "../repositories/ServicesRepository";

class SchedulesService{
    private schedulesRepository: SchedulesRepository;
    constructor(){
        this.schedulesRepository = new SchedulesRepository();
    }
    async create({ name, phone, date }: ICreate){
        console.log('date:', date);
        const dateFormatted = new Date(date);

        const hourStart = startOfHour(dateFormatted);
        console.log('hourStart:', hourStart);
        
        const hour = getHours(hourStart)
        if (hour <= 9 || hour >= 19) {
            throw new Error('Create schedule between 9 and 19.');
        }
        
        if(isBefore(hourStart, new Date())){
            throw new Error('It is not allowed to schedule old date');    
        }

        const checkIsAvailable = await this.schedulesRepository.find(hourStart);
        if (checkIsAvailable) {
            throw new Error('Schedule date is not available');
        }

        const create = await this.schedulesRepository.create({
            name,
            phone,
            date: hourStart,
        });
        return create;
    }
    async index(date: Date){
        const result = await this.schedulesRepository.findAll(date);
        console.log("result:", result);
        return result;
    }
    async update(id: string, date: Date){
        const dateFormatted = new Date(date);

        const hourStart = startOfHour(dateFormatted);
        console.log('hourStart:', hourStart);    
        
        if(isBefore(hourStart, new Date())){
            throw new Error('It is not allowed to schedule old date');    
        }

        const checkIsAvailable = await this.schedulesRepository.find(hourStart);
        if (checkIsAvailable) {
            throw new Error('Schedule date is not available');
        }

        const result = await this.schedulesRepository.update(id, date);
        return result;
    }
}
export { SchedulesService }