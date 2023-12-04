import { Request, Response } from 'express';
import { ShiftsService } from '../services/shiftsService';
import { handleError } from '../utils/handleError'
import { CustomError } from '../errors/CustomError'

export class ShiftsController {
  private service: ShiftsService;

  constructor(service: ShiftsService) {
    this.service = service;
  }

  getAllShifts = async (req: Request, res: Response): Promise<void> => {
    try {
        const shifts = await this.service.getAllShifts();
        res.json(shifts);
    } catch (err) {
      if (err instanceof CustomError) {
        res.status(err.statusCode).send(err.message);
      } else {
        res.status(500).send('Server error');
      }
    }
};

  checkShiftOverlap = async (req: Request, res: Response): Promise<void> => {
    try {
        const shiftId1 = parseInt(req.params.shiftId1);
        const shiftId2 = parseInt(req.params.shiftId2);

        // Validate the parsed integers
        if (isNaN(shiftId1) || isNaN(shiftId2)) {
          res.status(400).send('Invalid shift IDs');
          return;
        }
        const result = await this.service.checkShiftOverlap(shiftId1, shiftId2);
        res.json(result);
    } catch (err) {
      console.error(err);
      handleError(res, err as Error);
    }
  };

  getRemainingSpots = async (req: Request, res: Response): Promise<void> => {
    try {
        const spots = await this.service.getRemainingSpots();
        res.json(spots);
    } catch (err) {
        console.error(err);
        handleError(res, err as Error);
    }
  };

  getNurseJobAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await this.service.getNurseJobAvailability();
        res.json(data);
    } catch (err) {
        console.error(err);
        handleError(res, err as Error);
    }
  };

  getCoWorkersOfNurse = async (req: Request, res: Response): Promise<void> => {
    try {
        const nurseName = req.params.nurseName;
        const coWorkers = await this.service.getCoWorkersOfNurse(nurseName);
        res.json(coWorkers);
    } catch (err) {
        console.error(err);
        handleError(res, err as Error);
    }
  };



}
