/**
 * Group Class Field Component
 * Checkbox for group class selection
 */

import { Controller } from 'react-hook-form';
import { FormControlLabel, Checkbox, Typography } from '@mui/material';
import type { BaseFieldProps } from './types';

interface GroupClassFieldProps extends BaseFieldProps {}

export function GroupClassField({ control, errors }: GroupClassFieldProps) {
  return (
    <Controller
      name="groupClass"
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Checkbox {...field} checked={field.value} size="small" />}
          label={<Typography variant="body2">グループクラス</Typography>}
          sx={{ pt: 0.5 }}
        />
      )}
    />
  );
}
