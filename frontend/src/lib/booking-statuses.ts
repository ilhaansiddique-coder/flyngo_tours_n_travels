export const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'paid', label: 'Paid' },
] as const;

export const HAJJ_UMRAH_BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'paid', label: 'Paid' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const STATUS_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  in_progress: 'info',
  completed: 'info',
  cancelled: 'danger',
  paid: 'success',
};

export const HAJJ_UMRAH_STATUS_VARIANT: Record<string, 'default' | 'info' | 'cyan' | 'success' | 'danger'> = {
  pending: 'default',
  confirmed: 'info',
  paid: 'cyan',
  completed: 'success',
  cancelled: 'danger',
};
