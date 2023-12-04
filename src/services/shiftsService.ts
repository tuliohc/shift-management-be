import { ShiftsRepository } from '../repositories/shiftsRepository';
import { Shift } from '../models/shift';
import { convertTimeToMinutes } from '../utils/timeUtils'
import { NotFoundError } from '../errors/NotFoundError'

interface OverlapResult {
  totalOverlapMinutes: number;
  maxOverlapThreshold: number;
  exceedsThreshold: boolean;
}

export class ShiftsService {
  private repository: ShiftsRepository;

  constructor(repository: ShiftsRepository) {
    this.repository = repository;
  }

  async getAllShifts(): Promise<Shift[]> {
    try {
      return await this.repository.getAllShifts();
    } catch (error) {
      throw new Error('Error fetching all shifts');
    }
  }

  async checkShiftOverlap(shiftId1: number, shiftId2: number): Promise<OverlapResult> {

    try {
      const shift1 = await this.repository.getShiftById(shiftId1);
      const shift2 = await this.repository.getShiftById(shiftId2);

      if (!shift1 || !shift2) {
        throw new NotFoundError("Shift not found");
      }

      // Convert times to comparable format
      const shift1Start = convertTimeToMinutes(shift1.start_time);
      const shift1End = convertTimeToMinutes(shift1.end_time);
      const shift2Start = convertTimeToMinutes(shift2.start_time);
      const shift2End = convertTimeToMinutes(shift2.end_time);

      let overlapMinutes = 0;
      let maxOverlapThreshold = (shift1.facility_id === shift2.facility_id) ? 30 : 0;

      // Check for overlap
      if (shift1Start < shift2End && shift2Start < shift1End) {
          // Calculate overlap
          const overlapStart = Math.max(shift1Start, shift2Start);
          const overlapEnd = Math.min(shift1End, shift2End);
          overlapMinutes = Math.max(0, overlapEnd - overlapStart);
      }

      const exceedsThreshold = overlapMinutes > maxOverlapThreshold;

      return {
          totalOverlapMinutes: overlapMinutes,
          maxOverlapThreshold: maxOverlapThreshold,
          exceedsThreshold: exceedsThreshold
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Error checking shift overlap');
    }
  }

  async getRemainingSpots(): Promise<any[]> {
    try {
      return await this.repository.getRemainingSpots();
    } catch (error) {
      throw new Error('Error fetching remaining spots');
    }
  }

  async getNurseJobAvailability(): Promise<any[]> {
    try {
      return await this.repository.getNurseJobAvailability();
    } catch (error) {
      throw new Error('Error fetching nurse job availability');
    }
  }

  async getCoWorkersOfNurse(nurseName: string): Promise<any[]> {
    try {
      return await this.repository.getCoWorkersOfNurse(nurseName);
    } catch (error) {
      throw new Error(`Error fetching co-workers of nurse ${nurseName}`);
    }
  }

}
