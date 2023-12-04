export class QueryBuilder {
  private query: string;
  private parameters: any[];
  private orderByUsed: boolean;

  constructor() {
    this.query = '';
    this.parameters = [];
    this.orderByUsed = false;
  }

  select(fields: string | string[]): QueryBuilder {
    this.query += 'SELECT ' + (Array.isArray(fields) ? fields.join(', ') : fields);
    return this;
  }

  from(table: string): QueryBuilder {
    this.query += ' FROM ' + table;
    return this;
  }

  join(joinClause: string): QueryBuilder {
    this.query += ' JOIN ' + joinClause;
    return this;
  }

  leftJoin(joinClause: string): QueryBuilder {
    this.query += ' LEFT JOIN ' + joinClause;
    return this;
  }

  where(condition: string, parameters?: any[]): QueryBuilder {
    this.query += ' WHERE ' + condition;
    this.parameters.push(...(parameters || []));
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    if (!this.orderByUsed) {
      this.query += ' ORDER BY';
      this.orderByUsed = true;
    }

    this.query += ` ${field} ${direction},`;
    return this;
  }

  groupBy(groupByClause: string): QueryBuilder {
    this.query += ' GROUP BY ' + groupByClause;
    return this;
  }

  build(): [string, any[]] {
    this.query = this.query.replace(/,\s*$/, '');
    return [this.query, this.parameters];
  }
}
