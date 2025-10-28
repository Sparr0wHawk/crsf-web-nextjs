/**
 * Shared types for operation table search form field components
 */

import { Control, FieldErrors } from 'react-hook-form';
import type { SearchFormData } from '../../searchFormSchema';

/**
 * Base props that all field components receive
 */
export interface BaseFieldProps {
  control: Control<SearchFormData>;
  errors?: FieldErrors<SearchFormData>;
}
