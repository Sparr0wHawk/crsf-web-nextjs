/**
 * Provisional Booking Field Component
 * Radio group for provisional booking selection (yes/no)
 */

import { Controller } from 'react-hook-form';
import { Box, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import type { BaseFieldProps } from './types';

interface ProvisionalBookingFieldProps extends BaseFieldProps {}

export function ProvisionalBookingField({ control, errors }: ProvisionalBookingFieldProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.3 }}>
        仮引当実施
      </Typography>
      <Controller
        name="provisionalBooking"
        control={control}
        render={({ field }) => (
          <RadioGroup {...field} row>
            <FormControlLabel 
              value="no" 
              control={<Radio size="small" />} 
              label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>しない</Typography>}
            />
            <FormControlLabel 
              value="yes" 
              control={<Radio size="small" />} 
              label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>する</Typography>}
            />
          </RadioGroup>
        )}
      />
    </Box>
  );
}
