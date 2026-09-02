import { Injectable, NotImplementedException } from '@nestjs/common';

// Phase 2 decision: accept any positive integer point amount and round the
// calculated BDT discount down to the nearest whole taka.
export const REDEMPTION_ROUNDING_POLICY = 'floor_bdt' as const;

@Injectable()
export class RedemptionService {
  redeem(): never {
    throw new NotImplementedException('Point redemption is planned for Phase 2');
  }

  quote(): never {
    throw new NotImplementedException('Redemption quotes are planned for Phase 2');
  }
}
