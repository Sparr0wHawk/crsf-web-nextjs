/**
 * Office Field Component
 * Complex autocomplete field with shop search and modal trigger
 */

import { Autocomplete, TextField, IconButton, InputAdornment, Box, Typography } from '@mui/material';
import { Store as StoreIcon } from '@mui/icons-material';
import type { BaseFieldProps } from './types';
import type { Shop } from '@/lib/api/contracts/shopSelection.contract';

interface OfficeFieldProps extends BaseFieldProps {
  value: any;
  searchText: string;
  shopSearchResults: { shops: Shop[] } | undefined;
  onSearchTextChange: (text: string) => void;
  onValueChange: (value: any) => void;
  onOpenModal: () => void;
  size?: 'small' | 'medium';
}

export function OfficeField({ 
  control,
  errors,
  value,
  searchText,
  shopSearchResults,
  onSearchTextChange,
  onValueChange,
  onOpenModal,
  size = 'small'
}: OfficeFieldProps) {
  return (
    <Autocomplete
      freeSolo
      options={shopSearchResults?.shops || []}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
      getOptionKey={(option) => typeof option === 'string' ? option : option.code}
      value={value}
      onChange={(_, newValue) => onValueChange(newValue)}
      inputValue={searchText}
      onInputChange={(_, newInputValue) => onSearchTextChange(newInputValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="営業所"
          size={size}
          placeholder="入力または選択..."
          error={!!errors?.officeCode}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={onOpenModal}
                    edge="end"
                    sx={{ mr: -0.5 }}
                  >
                    <StoreIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        if (typeof option === 'string') return null;
        const { key, ...otherProps } = props as any;
        return (
          <li key={option.code} {...otherProps}>
            <Box>
              <Typography variant="body2">{option.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.address}
              </Typography>
            </Box>
          </li>
        );
      }}
      size={size}
      fullWidth
    />
  );
}
