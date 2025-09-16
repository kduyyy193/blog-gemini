import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { 
  PaginationOptions, 
  PaginatedResponseDto, 
  SortOrder 
} from '../dto/pagination.dto';

@Injectable()
export class PaginationService {
  constructor(private prisma: PrismaClient) {}

  createPaginatedResponse<T>(
    data: T[], 
    total: number, 
    options: PaginationOptions
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(data, total, options.page, options.limit);
  }

  async paginate<T, WhereInput = Record<string, any>, OrderByInput = Record<string, any>>(
  modelDelegate: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: any) => Promise<number>;
  },
  options: PaginationOptions,
  where?: WhereInput,
  orderBy?: OrderByInput,
  include?: any
): Promise<PaginatedResponseDto<T>> {
  const { page, limit, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;

  const orderByClause = orderBy || 
    (sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' });

  const [total, data] = await Promise.all([
    modelDelegate.count({ where }),
    modelDelegate.findMany({
      where,
      skip,
      take: limit,
      orderBy: orderByClause,
      include,
    }),
  ]);

  return this.createPaginatedResponse(data, total, options);
}
}
