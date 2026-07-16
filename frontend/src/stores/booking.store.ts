import { create } from 'zustand';

interface BookingState {
  currentStep: number;
  selectedItem: unknown;
  totalAmount: number;
  appliedCoupon: unknown | null;
  setStep: (step: number) => void;
  setSelectedItem: (item: unknown) => void;
  setTotalAmount: (amount: number) => void;
  applyCoupon: (coupon: unknown) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentStep: 1,
  selectedItem: null,
  totalAmount: 0,
  appliedCoupon: null,
  setStep: (step) => set({ currentStep: step }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setTotalAmount: (amount) => set({ totalAmount: amount }),
  applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
  reset: () =>
    set({
      currentStep: 1,
      selectedItem: null,
      totalAmount: 0,
      appliedCoupon: null,
    }),
}));
