import { IsOptional, IsIn, IsInt, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';

/**
 * Query parameters shared by the public listing endpoints.
 *
 * This has to be a DTO rather than loose `@Query('minPrice')` params: the
 * global ValidationPipe runs with `forbidNonWhitelisted: true`, so any query
 * key not declared on the bound DTO makes the whole request 400. That is
 * exactly why flight search used to fail — the controller declared
 * `@Query() pagination: PaginationDto` alongside separate `@Query('origin')`
 * params, and `origin` was rejected as an unknown property.
 *
 * Everything is optional; an absent value means "don't filter on this".
 */
export class ListQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Minimum price, inclusive' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price, inclusive' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Result ordering',
    enum: ['price_asc', 'price_desc', 'newest', 'duration_asc', 'duration_desc', 'rating_desc'],
  })
  @IsOptional()
  @IsIn(['price_asc', 'price_desc', 'newest', 'duration_asc', 'duration_desc', 'rating_desc'])
  sort?: string;

  // ---- tours ----
  @ApiPropertyOptional({ description: 'Minimum trip length in days' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minDuration?: number;

  @ApiPropertyOptional({ description: 'Maximum trip length in days' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Tour difficulty', enum: ['easy', 'moderate', 'challenging'] })
  @IsOptional()
  @IsIn(['easy', 'moderate', 'challenging'])
  difficulty?: string;

  // ---- hotels ----
  @ApiPropertyOptional({ description: 'Minimum star rating', minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minStars?: number;

  // ---- flights ----
  @ApiPropertyOptional({ description: 'Cabin class', enum: ['economy', 'premium_economy', 'business', 'first'] })
  @IsOptional()
  @IsString()
  cabinClass?: string;

  @ApiPropertyOptional({ description: 'Airline name' })
  @IsOptional()
  @IsString()
  airline?: string;

  @ApiPropertyOptional({ description: 'Origin airport code' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ description: 'Destination airport code' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ description: 'Departure date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  date?: string;

  // ---- transport ----
  @ApiPropertyOptional({ description: 'Vehicle type', enum: ['car', 'bus', 'ferry', 'shuttle', 'microbus'] })
  @IsOptional()
  @IsString()
  vehicleType?: string;
}

/** Translate a `sort` value into a Prisma orderBy for a given price column. */
export function orderByFor(sort: string | undefined, priceField = 'price'): Record<string, unknown> {
  switch (sort) {
    case 'price_asc':
      return { [priceField]: 'asc' };
    case 'price_desc':
      return { [priceField]: 'desc' };
    case 'duration_asc':
      return { duration: 'asc' };
    case 'duration_desc':
      return { duration: 'desc' };
    case 'rating_desc':
      return { starRating: 'desc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}

/**
 * Build a Prisma range filter, or undefined when neither bound is set.
 * Returning undefined matters: `{}` would still be applied and, on a nullable
 * column, quietly change which rows match.
 */
export function priceRange(min?: number, max?: number): Record<string, number> | undefined {
  if (min === undefined && max === undefined) return undefined;
  const range: Record<string, number> = {};
  if (min !== undefined) range.gte = min;
  if (max !== undefined) range.lte = max;
  return range;
}
