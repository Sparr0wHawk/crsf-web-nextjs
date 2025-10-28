/**
 * Date Field Component
 * Handles year, month, day with calculated day-of-week helper text
 */

import { Controller, useFormContext } from 'react-hook-form';
import { TextField } from '@mui/material';
import type { BaseFieldProps } from './types';

interface DateFieldProps extends BaseFieldProps {
  helperText?: string;
  size?: 'small' | 'medium';
}

export function DateField({ control, errors, helperText, size = 'small' }: DateFieldProps) {
  const { setValue, watch } = useFormContext();
  const year = watch('year');
  const month = watch('month');
  const day = watch('day');

  return (
    <Controller
      name="year"
      control={control}
      render={({ field: { onChange, value } }) => (
        <TextField
          label="日付"
          type="date"
          fullWidth
          size={size}
          value={`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (!isNaN(date.getTime())) {
              setValue('year', date.getFullYear());
              setValue('month', date.getMonth() + 1);
              setValue('day', date.getDate());
            }
          }}
          InputLabelProps={{ shrink: true }}
          helperText={helperText}
          FormHelperTextProps={{ sx: { margin: 0, height: '1em', fontSize: '0.65rem' } }}
          error={!!errors?.year}
        />
      )}
    />
  );
}
