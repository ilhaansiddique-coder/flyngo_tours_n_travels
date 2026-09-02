import {
  PointReferenceType,
  PointTransactionStatus,
  PointTransactionType,
} from '@prisma/client';

// Phase 1 policy: points do not expire. An expiry policy can be introduced in
// a later phase with a dedicated EXPIRY ledger type and scheduled job.
export const POINTS_EXPIRY_POLICY = 'none' as const;

export interface LedgerEntryInput {
  userId: string;
  type: PointTransactionType;
  amount: number;
  status?: PointTransactionStatus;
  referenceType: PointReferenceType;
  referenceId: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionCursor {
  createdAt: string;
  id: string;
}
