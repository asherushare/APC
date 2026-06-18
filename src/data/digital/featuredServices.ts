import { demoServices } from './demoServices';

export const featuredServices = demoServices.filter((service) => service.featured === true);
