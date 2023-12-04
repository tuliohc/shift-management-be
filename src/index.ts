import express from 'express';
import { ShiftsRepository } from './repositories/shiftsRepository';
import { ShiftsService } from './services/shiftsService';
import { ShiftsController } from './controllers/shiftsController';
import cors from 'cors';
import pool from './db';

const app = express();
const port = 3001;

// Enable CORS for all requests
app.use(cors());

// Instantiate the dependencies
const shiftsRepository = new ShiftsRepository(pool);
const shiftsService = new ShiftsService(shiftsRepository);
const shiftsController = new ShiftsController(shiftsService);

// Define the route for getting all shifts
app.get('/shifts', shiftsController.getAllShifts);

// Define the route for checking shift overlap
app.get('/shifts/overlap/:shiftId1/:shiftId2', shiftsController.checkShiftOverlap);

// Question #4
app.get('/remaining-spots', shiftsController.getRemainingSpots);

// Question #5
app.get('/nurse-job-availability', shiftsController.getNurseJobAvailability);

// Question #6
app.get('/nurses/:nurseName/co-workers', shiftsController.getCoWorkersOfNurse);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
