/**
 * Section Field Component
 * Section dropdown from init data
 */

import { Controller } from 'react-hook-form';
import { TextField, MenuItem } from '@mui/material';
import { useOperationTableInit } from '../../hooks';
import type { BaseFieldProps } from './types';

interface SectionFieldProps extends BaseFieldProps {
  size?: 'small' | 'medium';
}

export function SectionField({ control, errors, size = 'small' }: SectionFieldProps) {
  const { data: initData } = useOperationTableInit();

  return (
    <Controller
      name="sectionCode"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label="部"
          fullWidth
          size={size}
          error={!!errors?.sectionCode}
        >
          <MenuItem value="">全て</MenuItem>
          {initData?.sections.map((section) => (
            <MenuItem key={section.code} value={section.code}>
              {section.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
