/**
 * Block Field Component
 * Cascading dropdown - depends on selected section
 */

import { Controller } from 'react-hook-form';
import { TextField, MenuItem } from '@mui/material';
import { useBlockList } from '../../hooks';
import type { BaseFieldProps } from './types';

interface BlockFieldProps extends BaseFieldProps {
  sectionCode: string;
  size?: 'small' | 'medium';
}

export function BlockField({ control, errors, sectionCode, size = 'small' }: BlockFieldProps) {
  const { data: blocks = [], isLoading } = useBlockList(sectionCode);

  return (
    <Controller
      name="blockCode"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label="ブロック"
          fullWidth
          size={size}
          disabled={!sectionCode || isLoading}
          error={!!errors?.blockCode}
        >
          <MenuItem value="">全て</MenuItem>
          {blocks.map((block) => (
            <MenuItem key={block.code} value={block.code}>
              {block.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
