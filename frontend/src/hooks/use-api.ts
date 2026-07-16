import { api } from '@/lib/api';

export function useApi() {
  const getTours = async () => api.get('/tours');
  const getTour = async (id: string) => api.get(`/tours/${id}`);
  const getHotels = async () => api.get('/hotels');
  const getHotel = async (id: string) => api.get(`/hotels/${id}`);
  const getFlights = async (params?: Record<string, string>) => api.get('/flights', { body: JSON.stringify(params) });
  const getVisaServices = async () => api.get('/visa');
  const getDestinations = async () => api.get('/destinations');
  const getBlogs = async () => api.get('/cms/blogs');
  const getBlog = async (slug: string) => api.get(`/cms/blogs/${slug}`);
  const getFaqs = async () => api.get('/cms/faqs');
  const getTestimonials = async () => api.get('/cms/testimonials');
  const getTenantSettings = async () => api.get('/tenant/settings');

  return {
    getTours,
    getTour,
    getHotels,
    getHotel,
    getFlights,
    getVisaServices,
    getDestinations,
    getBlogs,
    getBlog,
    getFaqs,
    getTestimonials,
    getTenantSettings,
  };
}
