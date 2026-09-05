'use client';

import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )flyngo-auth=([^;]*)'));
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    return parsed?.state?.accessToken || null;
  } catch {
    return null;
  }
}

export function useApi() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const auth = useCallback(() => ({ token: accessToken ?? getTokenFromCookie() ?? undefined }), [accessToken]);

  const getTours = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/tours' + qs, auth());
  }, [auth]);
  const createTour = useCallback(async (body: any) => api.post('/tours', body, auth()), [auth]);
  const updateTour = useCallback(async (id: string, body: any) => api.patch(`/tours/${id}`, body, auth()), [auth]);
  const deleteTour = useCallback(async (id: string) => api.delete(`/tours/${id}`, auth()), [auth]);

  const getHotels = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/hotels' + qs, auth());
  }, [auth]);
  const createHotel = useCallback(async (body: any) => api.post('/hotels', body, auth()), [auth]);
  const updateHotel = useCallback(async (id: string, body: any) => api.patch(`/hotels/${id}`, body, auth()), [auth]);
  const deleteHotel = useCallback(async (id: string) => api.delete(`/hotels/${id}`, auth()), [auth]);
  // Room inventory (bookable units) per hotel.
  const getHotelRooms = useCallback(async (hotelId: string) => api.get(`/hotels/${hotelId}/rooms`), []);
  const createHotelRoom = useCallback(async (hotelId: string, body: any) => api.post(`/hotels/${hotelId}/rooms`, body, auth()), [auth]);
  const updateHotelRoom = useCallback(async (hotelId: string, roomId: string, body: any) => api.patch(`/hotels/${hotelId}/rooms/${roomId}`, body, auth()), [auth]);
  const deleteHotelRoom = useCallback(async (hotelId: string, roomId: string) => api.delete(`/hotels/${hotelId}/rooms/${roomId}`, auth()), [auth]);

  const getFlights = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/flights' + qs, auth());
  }, [auth]);
  const createFlight = useCallback(async (body: any) => api.post('/flights', body, auth()), [auth]);
  const updateFlight = useCallback(async (id: string, body: any) => api.patch(`/flights/${id}`, body, auth()), [auth]);
  const deleteFlight = useCallback(async (id: string) => api.delete(`/flights/${id}`, auth()), [auth]);

  const getVisaServices = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/visa' + qs, auth());
  }, [auth]);
  const createVisaService = useCallback(async (body: any) => api.post('/visa', body, auth()), [auth]);
  const updateVisaService = useCallback(async (id: string, body: any) => api.patch(`/visa/${id}`, body, auth()), [auth]);
  const deleteVisaService = useCallback(async (id: string) => api.delete(`/visa/${id}`, auth()), [auth]);

  const getDestinations = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/destinations' + qs);
  }, []);
  const getDestinationAutocomplete = useCallback(async (q?: string, limit = 25, toursOnly = false) => {
    const qs = new URLSearchParams({ q: q || '', limit: String(limit), ...(toursOnly ? { toursOnly: 'true' } : {}) }).toString();
    return api.get('/destinations/autocomplete?' + qs);
  }, []);
  const resolveDestination = useCallback(async (name: string) => api.post('/destinations/resolve', { name }, auth()), [auth]);
  const createDestination = useCallback(async (body: any) => api.post('/destinations', body, auth()), [auth]);
  const updateDestination = useCallback(async (id: string, body: any) => api.patch(`/destinations/${id}`, body, auth()), [auth]);
  const deleteDestination = useCallback(async (id: string) => api.delete(`/destinations/${id}`, auth()), [auth]);

  const getBlogs = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/cms/blogs' + qs);
  }, []);
  const getBlogBySlug = useCallback(async (slug: string) => api.get(`/cms/blogs/${slug}`), []);

  const getTestimonials = useCallback(async () => api.get('/cms/testimonials'), []);
  const getFaqs = useCallback(async () => api.get('/cms/faqs'), []);

  const listBlogs = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/cms/admin/blogs' + qs, auth());
  }, [auth]);
  const createBlog = useCallback(async (body: any) => api.post('/cms/admin/blogs', body, auth()), [auth]);
  const updateBlog = useCallback(async (id: string, body: any) => api.patch(`/cms/admin/blogs/${id}`, body, auth()), [auth]);
  const deleteBlog = useCallback(async (id: string) => api.delete(`/cms/admin/blogs/${id}`, auth()), [auth]);

  const listPages = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/cms/pages' + qs, auth());
  }, [auth]);
  const createPage = useCallback(async (body: any) => api.post('/cms/pages', body, auth()), [auth]);
  const updatePage = useCallback(async (id: string, body: any) => api.patch(`/cms/pages/${id}`, body, auth()), [auth]);
  const deletePage = useCallback(async (id: string) => api.delete(`/cms/pages/${id}`, auth()), [auth]);

  const listFaqs = useCallback(async () => api.get('/cms/admin/faqs', auth()), [auth]);
  const createFaq = useCallback(async (body: any) => api.post('/cms/admin/faqs', body, auth()), [auth]);
  const updateFaq = useCallback(async (id: string, body: any) => api.patch(`/cms/admin/faqs/${id}`, body, auth()), [auth]);
  const deleteFaq = useCallback(async (id: string) => api.delete(`/cms/admin/faqs/${id}`, auth()), [auth]);

  const listTestimonials = useCallback(async () => api.get('/cms/admin/testimonials', auth()), [auth]);
  const createTestimonial = useCallback(async (body: any) => api.post('/cms/admin/testimonials', body, auth()), [auth]);
  const updateTestimonial = useCallback(async (id: string, body: any) => api.patch(`/cms/admin/testimonials/${id}`, body, auth()), [auth]);
  const deleteTestimonial = useCallback(async (id: string) => api.delete(`/cms/admin/testimonials/${id}`, auth()), [auth]);

  const getDashboard = useCallback(async () => api.get('/admin/dashboard', auth()), [auth]);
  const getAuditLogs = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/admin/audit-logs' + qs, auth());
  }, [auth]);
  const getRoles = useCallback(async () => api.get('/admin/roles', auth()), [auth]);
  const createRole = useCallback(async (body: any) => api.post('/admin/roles', body, auth()), [auth]);
  const updateRole = useCallback(async (id: string, body: any) => api.patch(`/admin/roles/${id}`, body, auth()), [auth]);
  const deleteRole = useCallback(async (id: string) => api.delete(`/admin/roles/${id}`, auth()), [auth]);
  const getPermissions = useCallback(async () => api.get('/admin/permissions', auth()), [auth]);

  const getTrash = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/admin/trash' + qs, auth());
  }, [auth]);
  const restoreTrashItem = useCallback(async (entity: string, id: string) => api.post(`/admin/trash/${entity}/${id}/restore`, {}, auth()), [auth]);
  const purgeTrashItem = useCallback(async (entity: string, id: string) => api.delete(`/admin/trash/${entity}/${id}`, auth()), [auth]);
  const createPermission = useCallback(async (body: any) => api.post('/admin/permissions', body, auth()), [auth]);
  const updatePermission = useCallback(async (id: string, body: any) => api.patch(`/admin/permissions/${id}`, body, auth()), [auth]);
  const deletePermission = useCallback(async (id: string) => api.delete(`/admin/permissions/${id}`, auth()), [auth]);

  const getCoupons = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/marketing/admin/coupons' + qs, auth());
  }, [auth]);
  const createCoupon = useCallback(async (body: any) => api.post('/marketing/admin/coupons', body, auth()), [auth]);
  const updateCoupon = useCallback(async (id: string, body: any) => api.patch(`/marketing/admin/coupons/${id}`, body, auth()), [auth]);
  const deleteCoupon = useCallback(async (id: string) => api.delete(`/marketing/admin/coupons/${id}`, auth()), [auth]);

  const getAffiliates = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/marketing/admin/affiliates' + qs, auth());
  }, [auth]);
  const createAffiliate = useCallback(async (body: any) => api.post('/marketing/admin/affiliates', body, auth()), [auth]);
  const updateAffiliate = useCallback(async (id: string, body: any) => api.patch(`/marketing/admin/affiliates/${id}`, body, auth()), [auth]);
  const deleteAffiliate = useCallback(async (id: string) => api.delete(`/marketing/admin/affiliates/${id}`, auth()), [auth]);

  // ---- Loyalty / Rewards ----
  const getLoyaltyOverview = useCallback(async () => api.get('/loyalty/overview', auth()), [auth]);
  const getLoyaltyReferralLink = useCallback(async () => api.get('/loyalty/referral-link', auth()), [auth]);
  const getLoyaltyReferrals = useCallback(async (status?: string) => api.get('/loyalty/referrals' + (status ? `?status=${encodeURIComponent(status)}` : ''), auth()), [auth]);
  const getLoyaltyHistory = useCallback(async (params?: Record<string, string>) => api.get('/loyalty/transactions' + (params ? '?' + new URLSearchParams(params).toString() : ''), auth()), [auth]);
  const getMyLoyalty = useCallback(async () => api.get('/loyalty/me', auth()), [auth]);
  const previewLoyaltyRedemption = useCallback(async (points: number) => api.post('/loyalty/redeem/preview', { points }, auth()), [auth]);
  const redeemLoyaltyPoints = useCallback(async (body: { points: number; bookingId?: string }) => api.post('/loyalty/redeem', body, auth()), [auth]);
  const getLoyaltyTiers = useCallback(async () => api.get('/loyalty/admin/tiers', auth()), [auth]);
  const upsertLoyaltyTier = useCallback(async (body: any) => api.post('/loyalty/admin/tiers', body, auth()), [auth]);
  const updateLoyaltyTier = useCallback(async (id: string, body: any) => api.patch(`/loyalty/admin/tiers/${id}`, body, auth()), [auth]);
  const deleteLoyaltyTier = useCallback(async (id: string) => api.delete(`/loyalty/admin/tiers/${id}`, auth()), [auth]);
  const getLoyaltyProductRules = useCallback(async (params?: { productType?: string }) => api.get('/loyalty/admin/product-rules' + (params?.productType ? `?productType=${params.productType}` : ''), auth()), [auth]);
  const upsertLoyaltyProductRule = useCallback(async (body: any) => api.post('/loyalty/admin/product-rules', body, auth()), [auth]);
  const deleteLoyaltyProductRule = useCallback(async (id: string) => api.delete(`/loyalty/admin/product-rules/${id}`, auth()), [auth]);
  const getLoyaltyMembers = useCallback(async (params?: Record<string, string>) => api.get('/loyalty/admin/members' + (params ? '?' + new URLSearchParams(params).toString() : ''), auth()), [auth]);
  const getLoyaltyTransactions = useCallback(async (params?: Record<string, string>) => api.get('/loyalty/admin/transactions' + (params ? '?' + new URLSearchParams(params).toString() : ''), auth()), [auth]);
  const getLoyaltyStats = useCallback(async () => api.get('/loyalty/admin/stats', auth()), [auth]);
  const adjustLoyaltyPoints = useCallback(async (userId: string, body: { points: number; reason: string; reference?: string }) => api.post(`/loyalty/admin/adjust/${userId}`, body, auth()), [auth]);

  // Refer & Earn (referrals/loyalty program)
  const getReferralProgram = useCallback(async () => api.get('/referrals/program', auth()), [auth]);
  const lookupReferralCode = useCallback(async (code: string) =>
    api.get(`/referrals/lookup?code=${encodeURIComponent(code)}`, auth()), [auth]);
  const getMyReferralSummary = useCallback(async () => api.get('/referrals/me', auth()), [auth]);
  const requestReferralPayout = useCallback(async (body: { amount: number; method: string; details?: any }) =>
    api.post('/referrals/me/payouts', body, auth()), [auth]);
  const getReferralSettings = useCallback(async () => api.get('/referrals/admin/settings', auth()), [auth]);
  const updateReferralSettings = useCallback(async (body: any) => api.patch('/referrals/admin/settings', body, auth()), [auth]);
  const getReferralOverview = useCallback(async () => api.get('/referrals/admin/overview', auth()), [auth]);
  const getReferralAdminReferrals = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/referrals/admin/referrals' + qs, auth());
  }, [auth]);
  const getReferralPayouts = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/referrals/admin/payouts' + qs, auth());
  }, [auth]);
  const updateReferralPayout = useCallback(async (id: string, body: { status: string; notes?: string }) =>
    api.patch(`/referrals/admin/payouts/${id}`, body, auth()), [auth]);
  const getReferralAdminAffiliates = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/referrals/admin/affiliates' + qs, auth());
  }, [auth]);
  const updateReferralAdminAffiliate = useCallback(async (id: string, body: { affiliateType?: string; commissionRate?: number; isActive?: boolean }) =>
    api.patch(`/referrals/admin/affiliates/${id}`, body, auth()), [auth]);

  // Tracking + ads
  // Public lead capture — any front-end form (hero search, enquiry, hajj pre-reg)
  // POSTs here. Tenant is resolved server-side, so no auth/header needed.
  const submitLead = useCallback(async (body: Record<string, unknown>) => api.post('/tracking/lead', body), []);
  const getTrackingSettings = useCallback(async () => api.get('/tracking/admin/settings', auth()), [auth]);
  const updateTrackingSettings = useCallback(async (body: any) => api.patch('/tracking/admin/settings', body, auth()), [auth]);
  const getTrackingStats = useCallback(async (days = 30) => api.get(`/tracking/admin/stats?days=${days}`, auth()), [auth]);
  const getLeads = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/tracking/admin/leads' + qs, auth());
  }, [auth]);
  const updateLead = useCallback(async (id: string, body: any) =>
    api.patch(`/tracking/admin/leads/${id}`, body, auth()), [auth]);
  const getAdminLandingPages = useCallback(async () => api.get('/tracking/admin/landing-pages', auth()), [auth]);
  const createAdminLandingPage = useCallback(async (body: any) => api.post('/tracking/admin/landing-pages', body, auth()), [auth]);
  const updateAdminLandingPage = useCallback(async (id: string, body: any) => api.patch(`/tracking/admin/landing-pages/${id}`, body, auth()), [auth]);
  const deleteAdminLandingPage = useCallback(async (id: string) => api.delete(`/tracking/admin/landing-pages/${id}`, auth()), [auth]);

  const getUsers = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/users' + qs, auth());
  }, [auth]);
  const getUserById = useCallback(async (id: string) => api.get(`/users/${id}`, auth()), [auth]);
  const createUser = useCallback(async (body: any) => api.post('/users', body, auth()), [auth]);
  const updateUser = useCallback(async (id: string, body: any) => api.patch(`/users/${id}`, body, auth()), [auth]);
  const deleteUser = useCallback(async (id: string) => api.delete(`/users/${id}`, auth()), [auth]);
  const uploadCustomerNationalIdFront = useCallback(async (id: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.upload(`/users/${id}/nid-front`, fd, auth());
  }, [auth]);
  const uploadCustomerNationalIdBack = useCallback(async (id: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.upload(`/users/${id}/nid-back`, fd, auth());
  }, [auth]);
  const uploadCustomerPassport = useCallback(async (id: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.upload(`/users/${id}/passport`, fd, auth());
  }, [auth]);

  // Password reset (public — no auth). Options lists which channels can receive
  // the link; forgotPassword sends it; resetPassword consumes the token.
  const passwordResetOptions = useCallback(
    async (identifier: string) => api.post('/auth/forgot-password/options', { identifier }),
    [],
  );
  const sendPasswordReset = useCallback(
    async (identifier: string, channel: 'email' | 'sms') =>
      api.post('/auth/forgot-password', { identifier, channel }),
    [],
  );
  const resetPassword = useCallback(
    async (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
    [],
  );

  const getBookings = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/bookings/admin/all' + qs, auth());
  }, [auth]);
  const createBooking = useCallback(async (body: Record<string, unknown>) => api.post('/bookings', body, auth()), [auth]);
  // Proper hotel booking (room inventory, nights, per-night pricing) vs the
  // generic /bookings path that prices a hotel at 0.
  const createHotelBooking = useCallback(async (body: Record<string, unknown>) => api.post('/bookings/hotel', body, auth()), [auth]);
  // Hajj/Umrah: dedicated endpoint that enforces passport validity, mahram
  // rules and seat inventory, and records each pilgrim.
  const createHajjUmrahBooking = useCallback(async (body: Record<string, unknown>) => api.post('/hajj-umrah-bookings', body, auth()), [auth]);
  // Public: look up a booking's status by its FLY- code (no auth needed).
  const trackBooking = useCallback(async (code: string) => api.get(`/bookings/track/${encodeURIComponent(code.trim())}`), []);
  const adminCreateBooking = useCallback(async (body: Record<string, unknown>) => api.post('/bookings/admin', body, auth()), [auth]);
  const cancelBooking = useCallback(async (id: string) => api.post(`/bookings/${id}/cancel`, {}, auth()), [auth]);
  const updateBookingStatus = useCallback(async (id: string, status: string) =>
    api.patch(`/bookings/admin/${id}/status`, { status }, auth()), [auth]);
  // Trash: soft delete (reversible) → restore, or purge permanently.
  const deleteBooking = useCallback(async (id: string) => api.delete(`/bookings/admin/${id}`, auth()), [auth]);
  const getTrashedBookings = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/bookings/admin/trash' + qs, auth());
  }, [auth]);
  const restoreBooking = useCallback(async (id: string) => api.post(`/bookings/admin/${id}/restore`, {}, auth()), [auth]);
  const purgeBooking = useCallback(async (id: string) => api.delete(`/bookings/admin/${id}/purge`, auth()), [auth]);

  const getPayments = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/payments/admin/all' + qs, auth());
  }, [auth]);
  const getPaymentStats = useCallback(async () => api.get('/payments/admin/stats', auth()), [auth]);
  const updatePaymentStatus = useCallback(async (id: string, status: string) =>
    api.patch(`/payments/admin/${id}/status`, { status }, auth()), [auth]);
  const recordAdminPayment = useCallback(async (body: Record<string, unknown>) =>
    api.post('/payments/admin/record', body, auth()), [auth]);
  const getPaymentMethods = useCallback(async () => api.get('/payments/methods'), []);
  const getBookingPayment = useCallback(async (code: string) =>
    api.get(`/payments/booking/${encodeURIComponent(code.trim())}`), []);
  const uploadPaymentReceipt = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.upload('/payments/receipt', fd, auth());
  }, [auth]);
  const submitPaymentConfirmation = useCallback(async (body: Record<string, unknown>) =>
    api.post('/payments/confirm', body, auth()), [auth]);
  const getBankAccounts = useCallback(async () => api.get('/payments/admin/bank-accounts', auth()), [auth]);
  const createBankAccount = useCallback(async (body: Record<string, unknown>) =>
    api.post('/payments/admin/bank-accounts', body, auth()), [auth]);
  const updateBankAccount = useCallback(async (id: string, body: Record<string, unknown>) =>
    api.patch(`/payments/admin/bank-accounts/${id}`, body, auth()), [auth]);
  const deleteBankAccount = useCallback(async (id: string) =>
    api.delete(`/payments/admin/bank-accounts/${id}`, auth()), [auth]);
  const getMobileWallets = useCallback(async () => api.get('/payments/admin/mobile-wallets', auth()), [auth]);
  const createMobileWallet = useCallback(async (body: Record<string, unknown>) =>
    api.post('/payments/admin/mobile-wallets', body, auth()), [auth]);
  const updateMobileWallet = useCallback(async (id: string, body: Record<string, unknown>) =>
    api.patch(`/payments/admin/mobile-wallets/${id}`, body, auth()), [auth]);
  const deleteMobileWallet = useCallback(async (id: string) =>
    api.delete(`/payments/admin/mobile-wallets/${id}`, auth()), [auth]);
  const getMyInvoices = useCallback(async () => api.get('/invoices/my', auth()), [auth]);
  const getInvoice = useCallback(async (id: string) => api.get(`/invoices/${id}`, auth()), [auth]);
  const sendInvoiceEmail = useCallback(async (id: string) => api.post(`/invoices/${id}/send-email`, {}, auth()), [auth]);
  const downloadInvoicePdf = useCallback(async (id: string) => {
    const { accessToken } = useAuthStore.getState();
    const headers: Record<string, string> = {};
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    const res = await fetch(`/api/v1/invoices/${id}/pdf`, { headers });
    if (!res.ok) throw new Error('Could not download invoice');
    return await res.blob();
  }, []);
  const openInvoicePdf = useCallback(async (id: string) => {
    const blob = await downloadInvoicePdf(id);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Revoke the object URL once the new window has had a chance to load it.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, [downloadInvoicePdf]);
  const getAdminInvoices = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/invoices/admin/all' + qs, auth());
  }, [auth]);

  const getTransport = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/transport' + qs, auth());
  }, [auth]);

  const getHajjPackages = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/hajj-packages' + qs, auth());
  }, [auth]);
  const createHajjPackage = useCallback(async (body: any) => api.post('/hajj-packages', body, auth()), [auth]);
  const updateHajjPackage = useCallback(async (id: string, body: any) => api.patch(`/hajj-packages/${id}`, body, auth()), [auth]);
  const deleteHajjPackage = useCallback(async (id: string) => api.delete(`/hajj-packages/${id}`, auth()), [auth]);

  const getUmrahPackages = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/umrah-packages' + qs, auth());
  }, [auth]);
  const createUmrahPackage = useCallback(async (body: any) => api.post('/umrah-packages', body, auth()), [auth]);
  const updateUmrahPackage = useCallback(async (id: string, body: any) => api.patch(`/umrah-packages/${id}`, body, auth()), [auth]);
  const deleteUmrahPackage = useCallback(async (id: string) => api.delete(`/umrah-packages/${id}`, auth()), [auth]);

  const getVisaCountries = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/visa-countries' + qs, auth());
  }, [auth]);
  const createVisaCountry = useCallback(async (body: any) => api.post('/visa-countries', body, auth()), [auth]);
  const updateVisaCountry = useCallback(async (id: string, body: any) => api.patch(`/visa-countries/${id}`, body, auth()), [auth]);
  const deleteVisaCountry = useCallback(async (id: string) => api.delete(`/visa-countries/${id}`, auth()), [auth]);

  const submitHajjPreRegistration = useCallback(async (body: any) => api.post('/hajj-pre-registration', body), []);
  const getHajjPreRegistrations = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/hajj-pre-registration' + qs, auth());
  }, [auth]);
  const updateHajjPreRegistrationStatus = useCallback(async (id: string, status: string) =>
    api.patch(`/hajj-pre-registration/${id}/status`, { status }, auth()), [auth]);
  const deleteHajjPreRegistration = useCallback(async (id: string) =>
    api.delete(`/hajj-pre-registration/${id}`, auth()), [auth]);
  // Hajj/Umrah bookings live in their own table with their own admin endpoints.
  const getHajjUmrahBookings = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/hajj-umrah-bookings/admin/all' + qs, auth());
  }, [auth]);
  const updateHajjUmrahBookingStatus = useCallback(async (id: string, status: string) =>
    api.patch(`/hajj-umrah-bookings/admin/${id}/status`, { status }, auth()), [auth]);
  const createTransport = useCallback(async (body: any) => api.post('/transport', body, auth()), [auth]);
  const updateTransport = useCallback(async (id: string, body: any) => api.patch(`/transport/${id}`, body, auth()), [auth]);
  const deleteTransport = useCallback(async (id: string) => api.delete(`/transport/${id}`, auth()), [auth]);

  const getReviews = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/admin/reviews' + qs, auth());
  }, [auth]);
  // Public: approved reviews + summary for a product; and customer submission.
  const getPublicReviews = useCallback(async (itemType: string, itemId: string) =>
    api.get(`/reviews?itemType=${encodeURIComponent(itemType)}&itemId=${encodeURIComponent(itemId)}`), []);
  const submitReview = useCallback(async (body: { itemType: string; itemId: string; rating: number; title?: string; content: string }) =>
    api.post('/reviews', body, auth()), [auth]);
  const approveReview = useCallback(async (id: string, isApproved: boolean) =>
    api.patch(`/admin/reviews/${id}/approve`, { isApproved }, auth()), [auth]);
  const deleteReview = useCallback(async (id: string) => api.delete(`/admin/reviews/${id}`, auth()), [auth]);

  const getNotifications = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/notifications/admin/all' + qs, auth());
  }, [auth]);
  const sendNotification = useCallback(async (body: { type: string; title: string; body: string; userId?: string; userIds?: string[] }) =>
    api.post('/notifications/admin/send', body, auth()), [auth]);
  const deleteNotification = useCallback(async (id: string) => api.delete(`/notifications/admin/${id}`, auth()), [auth]);

  // User self-service
  const getMyProfile = useCallback(async () => api.get('/users/me', auth()), [auth]);
  const updateMyProfile = useCallback(async (body: any) => api.patch('/users/me', body, auth()), [auth]);
  const uploadMyAvatar = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.upload('/users/me/avatar', fd, auth());
  }, [auth]);
  const getMyDocuments = useCallback(async () => api.get('/users/me/documents', auth()), [auth]);
  const uploadMyDocument = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.upload('/users/me/documents', fd, auth());
  }, [auth]);
  const deleteMyDocument = useCallback(async (id: string) => api.delete(`/users/me/documents/${id}`, auth()), [auth]);
  const getMyBookings = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/bookings' + qs, auth());
  }, [auth]);
  const cancelMyBooking = useCallback(async (id: string) => api.post(`/bookings/${id}/cancel`, {}, auth()), [auth]);
  const getMyPayments = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/payments/my' + qs, auth());
  }, [auth]);

  // Issues a one-time temporary password for a customer created by a booking.
  // The plaintext comes back exactly once, for handing over via WhatsApp.
  const issueCustomerCredentials = useCallback(
    async (userId: string) => api.post('/auth/admin/issue-credentials', { userId }, auth()),
    [auth],
  );

  // The public /tenant/settings omits gateway secrets entirely; the admin form
  // needs the masked variant so it can show which gateways are configured.
  const getTenantSettings = useCallback(async () => api.get('/tenant/admin/settings', auth()), [auth]);
  const updateTenantSettings = useCallback(async (body: any) => api.patch('/tenant/settings', body, auth()), [auth]);

  // Media library
  const listMedia = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/media' + qs);
  }, []);
  const uploadMedia = useCallback(async (file: File, opts?: { folder?: string; alt?: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    const qs = new URLSearchParams();
    if (opts?.folder) qs.set('folder', opts.folder);
    if (opts?.alt) qs.set('alt', opts.alt);
    const search = qs.toString();
    return api.upload(`/media/upload${search ? `?${search}` : ''}`, formData, auth());
  }, [auth]);
  const deleteMedia = useCallback(async (id: string) => api.delete(`/media/${id}`, auth()), [auth]);

  // Hero section
  const getHero = useCallback(async () => api.get('/hero'), []);
  const getHeroDefaults = useCallback(async () => api.get('/hero/defaults', auth()), [auth]);
  const saveHero = useCallback(async (body: any) => api.post('/hero', body, auth()), [auth]);

  // Globe cities + routes
  const listGlobeCities = useCallback(async () => api.get('/globe/admin/cities', auth()), [auth]);
  const createGlobeCity = useCallback(async (body: any) => api.post('/globe/admin/cities', body, auth()), [auth]);
  const updateGlobeCity = useCallback(async (id: string, body: any) => api.patch(`/globe/admin/cities/${id}`, body, auth()), [auth]);
  const deleteGlobeCity = useCallback(async (id: string) => api.delete(`/globe/admin/cities/${id}`, auth()), [auth]);
  const listGlobeRoutes = useCallback(async () => api.get('/globe/admin/routes', auth()), [auth]);
  const createGlobeRoute = useCallback(async (body: any) => api.post('/globe/admin/routes', body, auth()), [auth]);
  const updateGlobeRoute = useCallback(async (id: string, body: any) => api.patch(`/globe/admin/routes/${id}`, body, auth()), [auth]);
  const deleteGlobeRoute = useCallback(async (id: string) => api.delete(`/globe/admin/routes/${id}`, auth()), [auth]);

  // About page (CMS-driven)
  const getAboutPage = useCallback(async () => api.get('/about'), []);
  const getAboutMeta = useCallback(async () => api.get('/about/meta'), []);
  const saveAboutMeta = useCallback(async (body: any) => api.post('/about/meta', body, auth()), [auth]);
  const listAboutSections = useCallback(async () => api.get('/about/sections'), []);
  const listAboutSectionsAdmin = useCallback(async () => api.get('/about/admin/sections', auth()), [auth]);
  const createAboutSection = useCallback(async (body: any) => api.post('/about/admin/sections', body, auth()), [auth]);
  const updateAboutSection = useCallback(async (id: string, body: any) => api.patch(`/about/admin/sections/${id}`, body, auth()), [auth]);
  const deleteAboutSection = useCallback(async (id: string) => api.delete(`/about/admin/sections/${id}`, auth()), [auth]);
  const reorderAboutSections = useCallback(async (ids: string[]) => api.post('/about/admin/sections/reorder', { ids }, auth()), [auth]);
  const getAboutDefaults = useCallback(async () => api.get('/about/admin/defaults', auth()), [auth]);

  // CEO message
  const getCeoMessage = useCallback(async () => api.get('/about/ceo'), []);
  const listCeoMessagesAdmin = useCallback(async () => api.get('/about/admin/ceo', auth()), [auth]);
  const upsertCeoMessage = useCallback(async (body: any) => api.post('/about/admin/ceo', body, auth()), [auth]);
  const deleteCeoMessage = useCallback(async (id: string) => api.delete(`/about/admin/ceo/${id}`, auth()), [auth]);

  // Site nav + footer (owner-controlled site chrome)
  const getNavMenu = useCallback(async () => api.get('/site/nav'), []);
  const listNavMenuAdmin = useCallback(async () => api.get('/site/admin/nav', auth()), [auth]);
  const createNavMenu = useCallback(async (body: any) => api.post('/site/admin/nav', body, auth()), [auth]);
  const updateNavMenu = useCallback(async (id: string, body: any) => api.patch(`/site/admin/nav/${id}`, body, auth()), [auth]);
  const deleteNavMenu = useCallback(async (id: string) => api.delete(`/site/admin/nav/${id}`, auth()), [auth]);
  const reorderNavMenu = useCallback(async (items: { id: string; order: number; parentId?: string | null }[]) =>
    api.post('/site/admin/nav/reorder', { items }, auth()), [auth]);

  const getFooter = useCallback(async () => api.get('/site/footer'), []);
  const getFooterAdmin = useCallback(async () => api.get('/site/admin/footer', auth()), [auth]);
  const updateFooter = useCallback(async (body: any) => api.patch('/site/admin/footer', body, auth()), [auth]);

  // GDPR self-service
  const exportMyData = useCallback(() => api.get('/users/me/export', auth()), [auth]);
  const deleteMyAccount = useCallback((body: { confirmation: string }) => api.delete('/users/me', { ...auth(), body: JSON.stringify(body) }), [auth]);

  const globalSearch = useCallback(async (q: string) => {
    const term = q.trim();
    if (!term) {
      return { tours: [], hotels: [], flights: [], visa: [], transport: [], destinations: [], hajj: [], umrah: [], visaCountries: [] };
    }
    const params = { q: term, limit: '6' };
    const safe = async <T,>(p: Promise<any>): Promise<T[]> => {
      try {
        const res = await p;
        return Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      } catch {
        return [];
      }
    };
    const [tours, hotels, flights, visa, transport, destinations, hajj, umrah, visaCountries] = await Promise.all([
      safe<any>(getTours(params)),
      safe<any>(getHotels(params)),
      safe<any>(getFlights(params)),
      safe<any>(getVisaServices(params)),
      safe<any>(getTransport(params)),
      safe<any>(getDestinations(params)),
      safe<any>(getHajjPackages(params)),
      safe<any>(getUmrahPackages(params)),
      safe<any>(getVisaCountries(params)),
    ]);
    return { tours, hotels, flights, visa, transport, destinations, hajj, umrah, visaCountries };
  }, [getTours, getHotels, getFlights, getVisaServices, getTransport, getDestinations, getHajjPackages, getUmrahPackages, getVisaCountries]);

  return {
    getTours, createTour, updateTour, deleteTour,
    getHotels, createHotel, updateHotel, deleteHotel,
    getHotelRooms, createHotelRoom, updateHotelRoom, deleteHotelRoom,
    getFlights, createFlight, updateFlight, deleteFlight,
    getVisaServices, createVisaService, updateVisaService, deleteVisaService,
    globalSearch,
    getDestinations, getDestinationAutocomplete, resolveDestination, createDestination, updateDestination, deleteDestination,
    getBlogs, getBlogBySlug, getTestimonials, getFaqs,
    listBlogs, createBlog, updateBlog, deleteBlog,
    listPages, createPage, updatePage, deletePage,
    listFaqs, createFaq, updateFaq, deleteFaq,
    listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
    getDashboard, getAuditLogs,
    getRoles, createRole, updateRole, deleteRole,
    getPermissions, createPermission, updatePermission, deletePermission,
    getTrash, restoreTrashItem, purgeTrashItem,
    getCoupons, createCoupon, updateCoupon, deleteCoupon,
    getAffiliates, createAffiliate, updateAffiliate, deleteAffiliate,
    getLoyaltyOverview, getLoyaltyReferralLink, getLoyaltyReferrals, getLoyaltyHistory,
    getMyLoyalty, previewLoyaltyRedemption, redeemLoyaltyPoints,
    getLoyaltyTiers, upsertLoyaltyTier, updateLoyaltyTier, deleteLoyaltyTier,
    getLoyaltyProductRules, upsertLoyaltyProductRule, deleteLoyaltyProductRule,
    getLoyaltyMembers, getLoyaltyTransactions, getLoyaltyStats, adjustLoyaltyPoints,
    getReferralProgram, lookupReferralCode, getMyReferralSummary, requestReferralPayout,
    getReferralSettings, updateReferralSettings, getReferralOverview,
    getReferralAdminReferrals, getReferralPayouts, updateReferralPayout,
    getReferralAdminAffiliates, updateReferralAdminAffiliate,
    submitLead,
    getTrackingSettings, updateTrackingSettings, getTrackingStats,
    getLeads, updateLead,
    getAdminLandingPages, createAdminLandingPage, updateAdminLandingPage, deleteAdminLandingPage,
    getUsers, getUserById, createUser, updateUser, deleteUser, uploadCustomerNationalIdFront, uploadCustomerNationalIdBack, uploadCustomerPassport,
    passwordResetOptions, sendPasswordReset, resetPassword,
    getBookings, createBooking, createHotelBooking, createHajjUmrahBooking, trackBooking, adminCreateBooking, cancelBooking, updateBookingStatus,
    deleteBooking, getTrashedBookings, restoreBooking, purgeBooking,
    getPayments, getPaymentStats, updatePaymentStatus, recordAdminPayment,
    getPaymentMethods, getBookingPayment, uploadPaymentReceipt, submitPaymentConfirmation,
    getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount,
    getMobileWallets, createMobileWallet, updateMobileWallet, deleteMobileWallet,
    getMyInvoices, getInvoice, sendInvoiceEmail, downloadInvoicePdf, openInvoicePdf, getAdminInvoices,
    getTransport, createTransport, updateTransport, deleteTransport,
    getHajjPackages, createHajjPackage, updateHajjPackage, deleteHajjPackage,
    getUmrahPackages, createUmrahPackage, updateUmrahPackage, deleteUmrahPackage,
    getVisaCountries, createVisaCountry, updateVisaCountry, deleteVisaCountry,
    submitHajjPreRegistration, getHajjPreRegistrations, updateHajjPreRegistrationStatus, deleteHajjPreRegistration,
    getHajjUmrahBookings, updateHajjUmrahBookingStatus,
    getReviews, approveReview, deleteReview, getPublicReviews, submitReview,
    getNotifications, sendNotification, deleteNotification,
    getMyProfile, updateMyProfile, uploadMyAvatar, getMyDocuments, uploadMyDocument, deleteMyDocument,
    getMyBookings, cancelMyBooking, getMyPayments,
    getTenantSettings, updateTenantSettings, issueCustomerCredentials,
    listMedia, uploadMedia, deleteMedia,
    getHero, getHeroDefaults, saveHero,
    listGlobeCities, createGlobeCity, updateGlobeCity, deleteGlobeCity,
    listGlobeRoutes, createGlobeRoute, updateGlobeRoute, deleteGlobeRoute,
    getAboutPage, getAboutMeta, saveAboutMeta,
    listAboutSections, listAboutSectionsAdmin, createAboutSection,
    updateAboutSection, deleteAboutSection, reorderAboutSections, getAboutDefaults,
    getCeoMessage, listCeoMessagesAdmin, upsertCeoMessage, deleteCeoMessage,
    getNavMenu, listNavMenuAdmin, createNavMenu, updateNavMenu, deleteNavMenu, reorderNavMenu,
    getFooter, getFooterAdmin, updateFooter,
    exportMyData, deleteMyAccount,
  };
}
