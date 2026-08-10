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
    return api.get('/destinations' + qs, auth());
  }, [auth]);
  const createDestination = useCallback(async (body: any) => api.post('/destinations', body, auth()), [auth]);
  const updateDestination = useCallback(async (id: string, body: any) => api.patch(`/destinations/${id}`, body, auth()), [auth]);
  const deleteDestination = useCallback(async (id: string) => api.delete(`/destinations/${id}`, auth()), [auth]);

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

  const getUsers = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/users' + qs, auth());
  }, [auth]);
  const createUser = useCallback(async (body: any) => api.post('/users', body, auth()), [auth]);
  const updateUser = useCallback(async (id: string, body: any) => api.patch(`/users/${id}`, body, auth()), [auth]);
  const deleteUser = useCallback(async (id: string) => api.delete(`/users/${id}`, auth()), [auth]);

  const getBookings = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/bookings/admin/all' + qs, auth());
  }, [auth]);
  const createBooking = useCallback(async (body: Record<string, unknown>) => api.post('/bookings', body, auth()), [auth]);
  const adminCreateBooking = useCallback(async (body: Record<string, unknown>) => api.post('/bookings/admin', body, auth()), [auth]);
  const cancelBooking = useCallback(async (id: string) => api.post(`/bookings/${id}/cancel`, {}, auth()), [auth]);
  const updateBookingStatus = useCallback(async (id: string, status: string) =>
    api.patch(`/bookings/admin/${id}/status`, { status }, auth()), [auth]);

  const getPayments = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/payments/admin/all' + qs, auth());
  }, [auth]);
  const getPaymentStats = useCallback(async () => api.get('/payments/admin/stats', auth()), [auth]);
  const updatePaymentStatus = useCallback(async (id: string, status: string) =>
    api.patch(`/payments/admin/${id}/status`, { status }, auth()), [auth]);

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
  const createTransport = useCallback(async (body: any) => api.post('/transport', body, auth()), [auth]);
  const updateTransport = useCallback(async (id: string, body: any) => api.patch(`/transport/${id}`, body, auth()), [auth]);
  const deleteTransport = useCallback(async (id: string) => api.delete(`/transport/${id}`, auth()), [auth]);

  const getReviews = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/admin/reviews' + qs, auth());
  }, [auth]);
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
  const getMyBookings = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/bookings' + qs, auth());
  }, [auth]);
  const cancelMyBooking = useCallback(async (id: string) => api.post(`/bookings/${id}/cancel`, {}, auth()), [auth]);
  const getMyPayments = useCallback(async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/payments/my' + qs, auth());
  }, [auth]);

  const getTenantSettings = useCallback(async () => api.get('/tenant/settings', auth()), [auth]);
  const updateTenantSettings = useCallback(async (body: any) => api.patch('/tenant/settings', body, auth()), [auth]);

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
    getFlights, createFlight, updateFlight, deleteFlight,
    getVisaServices, createVisaService, updateVisaService, deleteVisaService,
    globalSearch,
    getDestinations, createDestination, updateDestination, deleteDestination,
    listBlogs, createBlog, updateBlog, deleteBlog,
    listPages, createPage, updatePage, deletePage,
    listFaqs, createFaq, updateFaq, deleteFaq,
    listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
    getDashboard, getAuditLogs,
    getRoles, createRole, updateRole, deleteRole,
    getPermissions, createPermission, updatePermission, deletePermission,
    getCoupons, createCoupon, updateCoupon, deleteCoupon,
    getAffiliates, createAffiliate, updateAffiliate, deleteAffiliate,
    getUsers, createUser, updateUser, deleteUser,
    getBookings, createBooking, adminCreateBooking, cancelBooking, updateBookingStatus,
    getPayments, getPaymentStats, updatePaymentStatus,
    getTransport, createTransport, updateTransport, deleteTransport,
    getHajjPackages, createHajjPackage, updateHajjPackage, deleteHajjPackage,
    getUmrahPackages, createUmrahPackage, updateUmrahPackage, deleteUmrahPackage,
    getVisaCountries, createVisaCountry, updateVisaCountry, deleteVisaCountry,
    submitHajjPreRegistration, getHajjPreRegistrations, updateHajjPreRegistrationStatus,
    getReviews, approveReview, deleteReview,
    getNotifications, sendNotification, deleteNotification,
    getMyProfile, updateMyProfile, getMyBookings, cancelMyBooking, getMyPayments,
    getTenantSettings, updateTenantSettings,
  };
}
