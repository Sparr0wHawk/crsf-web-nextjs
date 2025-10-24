import { z } from 'zod';

/**
 * Zod validation schema for Operation Table search form
 * Matches the SearchParams interface from the API contract
 */
export const searchFormSchema = z.object({
  // Date inputs
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  
  // Dropdowns
  sectionCode: z.string().default(''),
  blockCode: z.string().default(''),
  deploymentDivision: z.string().default(''),
  vehicleDivision: z.string().default(''),
  sortOrder: z.enum(['registration', 'class', 'name']).default('registration'),
  
  // Text fields
  officeCode: z.string().default(''),
  class1: z.string().default(''),
  class2: z.string().default(''),
  class3: z.string().default(''),
  class4: z.string().default(''),
  class5: z.string().default(''),
  vehicleTypeCode: z.string().default(''),
  
  // Checkboxes/Options
  groupClass: z.boolean().default(false),
  provisionalBooking: z.enum(['no', 'yes']).default('no'),
  
  // Display options
  displayRange: z.enum(['72hours', '2weeks']).default('72hours'),
  showIdleVehicles: z.boolean().default(true),
  showMaintenanceVehicles: z.boolean().default(true),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;

/**
 * Get default form values (today's date)
 */
export function getDefaultFormValues(): SearchFormData {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    sectionCode: '',
    blockCode: '',
    deploymentDivision: '',
    vehicleDivision: '',
    sortOrder: 'registration',
    officeCode: '',
    class1: '',
    class2: '',
    class3: '',
    class4: '',
    class5: '',
    vehicleTypeCode: '',
    groupClass: false,
    provisionalBooking: 'no',
    displayRange: '72hours',
    showIdleVehicles: true,
    showMaintenanceVehicles: true,
  };
}
