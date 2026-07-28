'use client';

import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export function useApi() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const auth = () => ({ token: accessToken ?? undefined });

  const getTours = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/tours' + qs, auth());
  };
  const getTour = async (id: string) => api.get(`/tours/${id}`, auth());
  const createTour = async (body: any) => api.post('/tours', body, auth());
  const updateTour = async (id: string, body: any) => api.patch(`/tours/${id}`, body, auth());
  const deleteTour = async (id: string) => api.delete(`/tours/${id}`, auth());

  const getHotels = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/hotels' + qs, auth());
  };
  const getHotel = async (id: string) => api.get(`/hotels/${id}`, auth());
  const createHotel = async (body: any) => api.post('/hotels', body, auth());
  const updateHotel = async (id: string, body: any) => api.patch(`/hotels/${id}`, body, auth());
  const deleteHotel = async (id: string) => api.delete(`/hotels/${id}`, auth());

  const getFlights = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/flights' + qs, auth());
  };
  const getFlight = async (id: string) => api.get(`/flights/${id}`, auth());
  const createFlight = async (body: any) => api.post('/flights', body, auth());
  const updateFlight = async (id: string, body: any) => api.patch(`/flights/${id}`, body, auth());
  const deleteFlight = async (id: string) => api.delete(`/flights/${id}`, auth());

  const getVisaServices = async () => api.get('/visa', auth());
  const createVisaService = async (body: any) => api.post('/visa', body, auth());
  const updateVisaService = async (id: string, body: any) => api.patch(`/visa/${id}`, body, auth());
  const deleteVisaService = async (id: string) => api.delete(`/visa/${id}`, auth());

  const getDestinations = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/destinations' + qs, auth());
  };
  const createDestination = async (body: any) => api.post('/destinations', body, auth());
  const updateDestination = async (id: string, body: any) => api.patch(`/destinations/${id}`, body, auth());
  const deleteDestination = async (id: string) => api.delete(`/destinations/${id}`, auth());

  const getBlogs = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/cms/blogs' + qs, auth());
  };
  const getBlog = async (slug: string) => api.get(`/cms/blogs/${slug}`, auth());
  const listBlogs = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/cms/admin/blogs' + qs, auth());
  };
  const createBlog = async (body: any) => api.post('/cms/admin/blogs', body, auth());
  const updateBlog = async (id: string, body: any) => api.patch(`/cms/admin/blogs/${id}`, body, auth());
  const deleteBlog = async (id: string) => api.delete(`/cms/admin/blogs/${id}`, auth());

  const listPages = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/cms/pages' + qs, auth());
  };
  const createPage = async (body: any) => api.post('/cms/pages', body, auth());
  const updatePage = async (id: string, body: any) => api.patch(`/cms/pages/${id}`, body, auth());
  const deletePage = async (id: string) => api.delete(`/cms/pages/${id}`, auth());

  const getFaqs = async () => api.get('/cms/faqs', auth());
  const listFaqs = async () => api.get('/cms/admin/faqs', auth());
  const createFaq = async (body: any) => api.post('/cms/admin/faqs', body, auth());
  const updateFaq = async (id: string, body: any) => api.patch(`/cms/admin/faqs/${id}`, body, auth());
  const deleteFaq = async (id: string) => api.delete(`/cms/admin/faqs/${id}`, auth());

  const getTestimonials = async () => api.get('/cms/testimonials', auth());
  const listTestimonials = async () => api.get('/cms/admin/testimonials', auth());
  const createTestimonial = async (body: any) => api.post('/cms/admin/testimonials', body, auth());
  const updateTestimonial = async (id: string, body: any) => api.patch(`/cms/admin/testimonials/${id}`, body, auth());
  const deleteTestimonial = async (id: string) => api.delete(`/cms/admin/testimonials/${id}`, auth());

  const getDashboard = async () => api.get('/admin/dashboard', auth());
  const getAuditLogs = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/admin/audit-logs' + qs, auth());
  };
  const getRoles = async () => api.get('/admin/roles', auth());
  const getPermissions = async () => api.get('/admin/permissions', auth());

  const getCoupons = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/marketing/admin/coupons' + qs, auth());
  };
  const createCoupon = async (body: any) => api.post('/marketing/admin/coupons', body, auth());
  const updateCoupon = async (id: string, body: any) => api.patch(`/marketing/admin/coupons/${id}`, body, auth());
  const deleteCoupon = async (id: string) => api.delete(`/marketing/admin/coupons/${id}`, auth());
  const getAffiliates = async () => api.get('/marketing/admin/affiliates', auth());

  const getUsers = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/users' + qs, auth());
  };
  const updateUser = async (id: string, body: any) => api.patch(`/users/${id}`, body, auth());
  const deleteUser = async (id: string) => api.delete(`/users/${id}`, auth());

  const getBookings = async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get('/bookings/admin/all' + qs, auth());
  };
  const createBooking = async (body: Record<string, unknown>) => api.post('/bookings', body, auth());
  const cancelBooking = async (id: string) => api.post(`/bookings/${id}/cancel`, {}, auth());
  const updateBookingStatus = async (id: string, status: string) =>
    api.patch(`/bookings/admin/${id}/status`, { status }, auth());

  const getTenantSettings = async () => api.get('/tenant/settings', auth());
  const updateTenantSettings = async (body: any) => api.patch('/tenant/settings', body, auth());

  const validateCoupon = async (code: string) => api.post('/marketing/coupons/validate', { code }, auth());

  return {
    getTours, getTour, createTour, updateTour, deleteTour,
    getHotels, getHotel, createHotel, updateHotel, deleteHotel,
    getFlights, getFlight, createFlight, updateFlight, deleteFlight,
    getVisaServices, createVisaService, updateVisaService, deleteVisaService,
    getDestinations, createDestination, updateDestination, deleteDestination,
    getBlogs, getBlog, listBlogs, createBlog, updateBlog, deleteBlog,
    listPages, createPage, updatePage, deletePage,
    getFaqs, listFaqs, createFaq, updateFaq, deleteFaq,
    getTestimonials, listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
    getDashboard, getAuditLogs, getRoles, getPermissions,
    getCoupons, createCoupon, updateCoupon, deleteCoupon, getAffiliates,
    getUsers, updateUser, deleteUser,
    getBookings, createBooking, cancelBooking, updateBookingStatus,
    getTenantSettings, updateTenantSettings,
    validateCoupon,
  };
}
