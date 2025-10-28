/**
 * Display Range Field Component
 * Radio group for search display range selection (72h/2weeks)
 */

import { Controller } from 'react-hook-form';
import { Box, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import type { BaseFieldProps } from './types';

interface DisplayRangeFieldProps extends BaseFieldProps {}

export function DisplayRangeField({ control, errors }: DisplayRangeFieldProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.3 }}>
        検索範囲
      </Typography>
      <Controller
        name="displayRange"
        control={control}
        render={({ field }) => (
          <RadioGroup {...field} row>
            <FormControlLabel 
              value="72hours" 
              control={<Radio size="small" />} 
              label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>72時間</Typography>}
            />
            <FormControlLabel 
              value="2weeks" 
              control={<Radio size="small" />} 
              label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>2週間</Typography>}
            />
          </RadioGroup>
        )}
      />
    </Box>
  );
}
