/**
 * Vehicle Division Field Component
 * Cascading dropdown - depends on selected deployment division
 */

import { Controller } from 'react-hook-form';
import { TextField, MenuItem } from '@mui/material';
import { useVehicleDivisions } from '../../hooks';
import type { BaseFieldProps } from './types';

interface VehicleDivisionFieldProps extends BaseFieldProps {
  deploymentDivision: string;
  size?: 'small' | 'medium';
}

export function VehicleDivisionField({ 
  control, 
  errors, 
  deploymentDivision, 
  size = 'small' 
}: VehicleDivisionFieldProps) {
  const { data: vehicleDivisions = [], isLoading } = useVehicleDivisions(deploymentDivision);

  return (
    <Controller
      name="vehicleDivision"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label="車両区分"
          fullWidth
          size={size}
          disabled={!deploymentDivision || isLoading}
          error={!!errors?.vehicleDivision}
        >
          <MenuItem value="">全て</MenuItem>
          {vehicleDivisions.map((division) => (
            <MenuItem key={division.code} value={division.code}>
              {division.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
