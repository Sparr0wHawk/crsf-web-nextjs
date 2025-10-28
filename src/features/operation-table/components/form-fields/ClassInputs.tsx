/**
 * Class Inputs Component
 * Grouped component with label + 5 class input fields
 */

import { Controller } from 'react-hook-form';
import { Grid, TextField, Typography } from '@mui/material';
import type { BaseFieldProps } from './types';
import type { SearchFormData } from '../../searchFormSchema';

interface ClassInputsProps extends BaseFieldProps {
  size?: 'small' | 'medium';
}

export function ClassInputs({ control, errors, size = 'small' }: ClassInputsProps) {
  return (
    <>
      <Grid size={{ xs: 2, sm: 1, md: 0.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ pt: 1, fontWeight: 500, lineHeight: '40px' }}>
          クラス
        </Typography>
      </Grid>

      {Array.from({ length: 5 }, (_, i) => (
        <Grid key={i} size={{ xs: 2, sm: 1.5, md: 0.7 }}>
          <Controller
            name={`class${i + 1}` as keyof SearchFormData}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder={`${i + 1}`}
                size={size}
                fullWidth
                inputProps={{ maxLength: 2, style: { textAlign: 'center' } }}
                error={!!errors?.[`class${i + 1}` as keyof SearchFormData]}
              />
            )}
          />
        </Grid>
      ))}
    </>
  );
}
