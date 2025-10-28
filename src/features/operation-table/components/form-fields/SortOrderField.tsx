/**
 * Sort Order Field Component
 * Dropdown for selecting sort order (registration/class/name)
 */

import { Controller } from 'react-hook-form';
import { TextField, MenuItem } from '@mui/material';
import type { BaseFieldProps } from './types';

interface SortOrderFieldProps extends BaseFieldProps {
  size?: 'small' | 'medium';
}

export function SortOrderField({ control, errors, size = 'small' }: SortOrderFieldProps) {
  return (
    <Controller
      name="sortOrder"
      control={control}
      render={({ field }) => (
        <TextField 
          {...field} 
          select 
          label="並び順" 
          fullWidth 
          size={size}
          error={!!errors?.sortOrder}
        >
          <MenuItem value="registration">登録番号順</MenuItem>
          <MenuItem value="class">クラス順</MenuItem>
          <MenuItem value="name">車名順</MenuItem>
        </TextField>
      )}
    />
  );
}
