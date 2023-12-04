import { Pool } from 'pg';
import { Shift } from '../models/shift';
import { QueryBuilder } from '../utils/queryBuilder';

export class ShiftsRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  //   SELECT 
  //      qs.*, 
  //      f.facility_name
  //   FROM 
  //      question_one_shifts qs
  //   JOIN 
  //      facilities f ON qs.facility_id = f.facility_id
  async getAllShifts(): Promise<Shift[]> {
    const queryBuilder = new QueryBuilder();
    const [query, parameters] = queryBuilder
      .select('qs.*, f.facility_name')
      .from('question_one_shifts qs')
      .join('facilities f ON qs.facility_id = f.facility_id')
      .build();

    const { rows } = await this.pool.query(query, parameters);
    return rows as Shift[];
  }

  // SELECT 
  //    *
  // FROM 
  //    question_one_shifts
  // WHERE 
  //    shift_id = $1
  async getShiftById(shiftId: number): Promise<Shift | null> {
    const queryBuilder = new QueryBuilder();
    const [query, parameters] = queryBuilder
        .select('*')
        .from('question_one_shifts')
        .where('shift_id = $1', [shiftId])
        .build();

    const { rows } = await this.pool.query(query, parameters);
    return rows.length > 0 ? rows[0] as Shift : null;
  }

  // Question #4
  //
  // SELECT 
  //   j.facility_id, 
  //   j.nurse_type_needed,
  //   SUM(j.total_number_nurses_needed) - COALESCE(COUNT(nhj.job_id), 0) AS remaining_spots
  // FROM 
  //   jobs j
  // LEFT JOIN 
  //   nurse_hired_jobs nhj ON j.job_id = nhj.job_id
  // GROUP BY 
  //   j.facility_id, j.nurse_type_needed
  // ORDER BY 
  //   j.facility_id ASC, j.nurse_type_needed ASC;
  async getRemainingSpots(): Promise<any[]> {
    const queryBuilder = new QueryBuilder();
    const [query, parameters] = queryBuilder
      .select([
        'j.facility_id',
        'j.nurse_type_needed',
        'SUM(j.total_number_nurses_needed) - COALESCE(COUNT(nhj.job_id), 0) AS remaining_spots',
      ])
      .from('jobs j')
      .leftJoin('nurse_hired_jobs nhj ON j.job_id = nhj.job_id')
      .groupBy('j.facility_id, j.nurse_type_needed')
      .orderBy('j.facility_id', 'ASC')
      .orderBy('j.nurse_type_needed', 'ASC')
      .build();
  
    const { rows } = await this.pool.query(query, parameters);
    return rows;
  }
  
  // Question #5
  //
  // SELECT 
  //   n.nurse_id, 
  //   n.nurse_name, 
  //   n.nurse_type, 
  // COUNT(j.job_id) AS available_jobs
  // FROM 
  //   nurses n
  // JOIN 
  //   jobs j ON n.nurse_type = j.nurse_type_needed 
  // LEFT JOIN 
  //   nurse_hired_jobs nhj ON n.nurse_id = nhj.nurse_id AND j.job_id = nhj.job_id
  // WHERE 
  //   nhj.job_id IS NULL
  // GROUP BY 
  //   n.nurse_id, n.nurse_name, n.nurse_type
  // ORDER BY 
  //   n.nurse_id;
  async getNurseJobAvailability(): Promise<any[]> {
    const queryBuilder = new QueryBuilder();
    const [query, parameters] = queryBuilder
        .select('n.nurse_id, n.nurse_name, n.nurse_type, COUNT(j.job_id) AS available_jobs')
        .from('nurses n')
        .join('jobs j ON n.nurse_type = j.nurse_type_needed')
        .leftJoin('nurse_hired_jobs nhj ON n.nurse_id = nhj.nurse_id AND j.job_id = nhj.job_id')
        .where('nhj.job_id IS NULL')
        .groupBy('n.nurse_id, n.nurse_name, n.nurse_type')
        .orderBy('n.nurse_id')
        .build();

    const { rows } = await this.pool.query(query, parameters);
    return rows;
  }

  // Question #6
  //
  // SELECT DISTINCT 
  //    n.nurse_name
  // FROM 
  //    nurses n
  // JOIN 
  //    nurse_hired_jobs nhj ON n.nurse_id = nhj.nurse_id
  // JOIN 
  //    jobs j ON nhj.job_id = j.job_id
  // WHERE 
  //    j.facility_id IN (
  //      SELECT 
  //          j.facility_id
  //      FROM 
  //          nurses n
  //      JOIN 
  //          nurse_hired_jobs nhj ON n.nurse_id = nhj.nurse_id
  //      JOIN 
  //          jobs j ON nhj.job_id = j.job_id
  //      WHERE 
  //          n.nurse_name = 'Anne'
  //    )
  // AND 
  //    n.nurse_name != 'Anne';
  async getCoWorkersOfNurse(nurseName: string): Promise<any[]> {
    const subQueryBuilder = new QueryBuilder();
    const [subQuery, subParameters] = subQueryBuilder
      .select('j.facility_id')
      .from('nurses n')
      .join('nurse_hired_jobs nhj ON n.nurse_id = nhj.nurse_id')
      .join('jobs j ON nhj.job_id = j.job_id')
      .where('n.nurse_name = $1', [nurseName])
      .build();
  
    const mainQueryBuilder = new QueryBuilder();
    const [mainQuery, parameters] = mainQueryBuilder
      .select('DISTINCT n.nurse_name')
      .from('nurses n')
      .join('nurse_hired_jobs nhj ON n.nurse_id = nhj.nurse_id')
      .join('jobs j ON nhj.job_id = j.job_id')
      .where(`j.facility_id IN (${subQuery}) AND n.nurse_name != $2`, [
        ...subParameters,
        nurseName,
      ])
      .build();
  
    const { rows } = await this.pool.query(mainQuery, parameters);
    return rows;
  }
  

}
