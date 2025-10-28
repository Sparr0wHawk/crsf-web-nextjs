/**
 * Vehicle Code Field Component
 * Simple text input for vehicle/car type code
 */

import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';
import type { BaseFieldProps } from './types';

interface VehicleCodeFieldProps extends BaseFieldProps {
  size?: 'small' | 'medium';
}

export function VehicleCodeField({ control, errors, size = 'small' }: VehicleCodeFieldProps) {
  return (
    <Controller
      name="vehicleTypeCode"
      control={control}
      render={({ field }) => (
        <TextField 
          {...field} 
          label="車種コード" 
          fullWidth 
          size={size}
          error={!!errors?.vehicleTypeCode}
        />
      )}
    />
  );
}
