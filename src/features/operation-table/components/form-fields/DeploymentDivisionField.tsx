/**
 * Deployment Division Field Component
 * Dropdown for deployment/using division selection
 */

import { Controller } from 'react-hook-form';
import { TextField, MenuItem } from '@mui/material';
import { useOperationTableInit } from '../../hooks';
import type { BaseFieldProps } from './types';

interface DeploymentDivisionFieldProps extends BaseFieldProps {
  size?: 'small' | 'medium';
}

export function DeploymentDivisionField({ control, errors, size = 'small' }: DeploymentDivisionFieldProps) {
  const { data: initData } = useOperationTableInit();

  return (
    <Controller
      name="deploymentDivision"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label="配備/運用区分"
          fullWidth
          size={size}
          error={!!errors?.deploymentDivision}
        >
          <MenuItem value="">全て</MenuItem>
          {initData?.dispositionAndUsingDivisions.map((division) => (
            <MenuItem key={division.code} value={division.code}>
              {division.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
