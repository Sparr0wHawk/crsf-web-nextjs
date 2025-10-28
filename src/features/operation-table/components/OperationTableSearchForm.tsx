/**
 * Operation Table Search Form Component
 * Main search form container that orchestrates all field components
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Paper, Grid, Box, Button } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  DateField,
  SectionField,
  BlockField,
  OfficeField,
  ClassInputs,
  GroupClassField,
  VehicleCodeField,
  DeploymentDivisionField,
  VehicleDivisionField,
  SortOrderField,
  ProvisionalBookingField,
  DisplayRangeField,
} from './form-fields';
import { searchFormSchema, getDefaultFormValues, type SearchFormData } from '@/app/operation-table/searchFormSchema';
import { useShopSearch } from '@/lib/hooks/useShopSelection';
import type { SearchParams } from '@/lib/api/contracts/operationTable.contract';
import type { SelectedShop, Shop } from '@/lib/api/contracts/shopSelection.contract';

interface OperationTableSearchFormProps {
  onSearch: (params: SearchParams) => void;
  onOpenShopModal: () => void;
  onShopSelect?: (shop: SelectedShop) => void;
  isLoading?: boolean;
}

export function OperationTableSearchForm({ 
  onSearch, 
  onOpenShopModal,
  onShopSelect,
  isLoading = false 
}: OperationTableSearchFormProps) {
  // Form setup
  const methods = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema) as any,
    defaultValues: getDefaultFormValues(),
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = methods;

  // Watch for cascading dependencies
  const selectedSection = watch('sectionCode');
  const selectedDeployment = watch('deploymentDivision');
  const year = watch('year');
  const month = watch('month');
  const day = watch('day');

  // Calculate day of week
  const dayOfWeek = useMemo(() => {
    try {
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return '';
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      return `(${days[date.getDay()]})`;
    } catch {
      return '';
    }
  }, [year, month, day]);

  // Shop selection state
  const [selectedShop, setSelectedShop] = useState<SelectedShop | null>(null);
  const [shopSearchText, setShopSearchText] = useState('');

  // Fetch shops for autocomplete (search by name)
  const { data: shopSearchResults } = useShopSearch(
    { shopName: shopSearchText },
    shopSearchText.length >= 2 // Only search if 2+ characters
  );

  // Reset cascading fields
  useEffect(() => {
    if (selectedSection) {
      setValue('blockCode', '');
    }
  }, [selectedSection, setValue]);

  useEffect(() => {
    if (selectedDeployment) {
      setValue('vehicleDivision', '');
    }
  }, [selectedDeployment, setValue]);

  // Submit handler
  const onSubmit = (data: SearchFormData) => {
    const searchDate = new Date(data.year, data.month - 1, data.day);
    
    const params: SearchParams = {
      searchDate,
      sectionCode: data.sectionCode || undefined,
      blockCode: data.blockCode || undefined,
      shopCode: data.officeCode || undefined,
      classCodes: [data.class1, data.class2, data.class3, data.class4, data.class5].filter(Boolean),
      carModelCode: data.vehicleTypeCode || undefined,
      dispositionAndUsingDivision: data.deploymentDivision || undefined,
      carDivision: data.vehicleDivision || undefined,
      sortDivision: data.sortOrder,
      provisionalBookingExecute: data.provisionalBooking === 'yes',
      searchScope: data.displayRange === '72hours' ? '72h' : '2weeks',
    };
    
    onSearch(params);
  };

  // Shop autocomplete handler
  const handleShopAutocompleteChange = (newValue: string | Shop | null) => {
    if (newValue && typeof newValue !== 'string') {
      const selected: SelectedShop = {
        code: newValue.code,
        name: newValue.name,
        address: newValue.address,
      };
      setSelectedShop(selected);
      setValue('officeCode', newValue.code);
      setShopSearchText(newValue.name);
      onShopSelect?.(selected);
    } else {
      setSelectedShop(null);
      setValue('officeCode', '');
      setShopSearchText(typeof newValue === 'string' ? newValue : '');
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }} className="no-print">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Row 1: Date, Section, Block, Office */}
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <DateField 
                    control={control} 
                    errors={errors}
                    helperText={dayOfWeek}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <SectionField 
                    control={control} 
                    errors={errors}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <BlockField 
                    control={control} 
                    errors={errors}
                    sectionCode={selectedSection}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 5.5 }}>
                  <OfficeField 
                    control={control}
                    errors={errors}
                    value={selectedShop}
                    searchText={shopSearchText}
                    shopSearchResults={shopSearchResults}
                    onSearchTextChange={setShopSearchText}
                    onValueChange={handleShopAutocompleteChange}
                    onOpenModal={onOpenShopModal}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Row 2: Class, Vehicle fields */}
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={1.5}>
                <ClassInputs control={control} errors={errors} />
                
                <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                  <GroupClassField control={control} errors={errors} />
                </Grid>

                <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                  <VehicleCodeField control={control} errors={errors} />
                </Grid>

                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <DeploymentDivisionField control={control} errors={errors} />
                </Grid>

                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <VehicleDivisionField 
                    control={control} 
                    errors={errors}
                    deploymentDivision={selectedDeployment}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
                  <SortOrderField control={control} errors={errors} />
                </Grid>
              </Grid>
            </Grid>

            {/* Row 3: Radio buttons + Search button */}
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <ProvisionalBookingField control={control} errors={errors} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DisplayRangeField control={control} errors={errors} />
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      startIcon={<SearchIcon />}
                      sx={{ minWidth: 150 }}
                      disabled={isLoading}
                    >
                      {isLoading ? '検索中...' : '検索'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </Paper>
  );
}
