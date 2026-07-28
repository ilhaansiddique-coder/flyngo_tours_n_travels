import { create } from 'zustand';

interface BookingFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  guests?: string;
  notes?: string;
  [key: string]: string | undefined;
}

interface BookingState {
  currentStep: number;
  selectedItem: unknown;
  totalAmount: number;
  appliedCoupon: unknown | null;
  formData: BookingFormData;
  setStep: (step: number) => void;
  setSelectedItem: (item: unknown) => void;
  setTotalAmount: (amount: number) => void;
  setFormData: (data: BookingFormData) => void;
  applyCoupon: (coupon: unknown) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentStep: 1,
  selectedItem: null,
  totalAmount: 0,
  appliedCoupon: null,
  formData: {},
  setStep: (step) => set({ currentStep: step }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setTotalAmount: (amount) => set({ totalAmount: amount }),
  setFormData: (data) => set({ formData: data }),
  applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
  reset: () =>
    set({
      currentStep: 1,
      selectedItem: null,
      totalAmount: 0,
      appliedCoupon: null,
      formData: {},
    }),
}));
