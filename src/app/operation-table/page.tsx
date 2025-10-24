'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, Print as PrintIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useOperationTableInit, useBlockList, useVehicleDivisions, useOperationTableData, useUpdateSchedule } from '@/features/operation-table/hooks';
import { searchFormSchema, getDefaultFormValues, type SearchFormData } from './searchFormSchema';
import { OperationTableDisplay } from '@/features/operation-table/components/OperationTableDisplay';
import type { SearchParams, ScheduleUpdate } from '@/lib/api/contracts/operationTable.contract';

export default function OperationTablePage() {
  const [apiSearchParams, setApiSearchParams] = useState<SearchParams | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch initial dropdown data
  const { data: initData, isLoading: isInitLoading, error: initError } = useOperationTableInit();

  // Fetch operation table data
  const { data: tableData, isLoading: isTableLoading, error: tableError } = useOperationTableData(
    apiSearchParams!,
    !!apiSearchParams
  );

  // Schedule update mutation (for drag-and-drop)
  const updateScheduleMutation = useUpdateSchedule(apiSearchParams || {} as SearchParams);

  // Setup form with React Hook Form + Zod
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(searchFormSchema),
    defaultValues: getDefaultFormValues(),
  });

  // Watch for section and deployment changes (for cascading dropdowns)
  const selectedSection = watch('sectionCode');
  const selectedDeployment = watch('deploymentDivision');

  // Fetch blocks when section changes
  const { data: blocks = [], isLoading: isBlocksLoading } = useBlockList(selectedSection);

  // Fetch vehicle divisions when deployment changes
  const { data: vehicleDivisions = [], isLoading: isVehicleDivisionsLoading } = useVehicleDivisions(selectedDeployment);

  // Reset block when section changes
  useEffect(() => {
    if (selectedSection) {
      setValue('blockCode', '');
    }
  }, [selectedSection, setValue]);

  // Reset vehicle division when deployment changes
  useEffect(() => {
    if (selectedDeployment) {
      setValue('vehicleDivision', '');
    }
  }, [selectedDeployment, setValue]);

  // Calculate day of week
  const year = watch('year');
  const month = watch('month');
  const day = watch('day');
  const dayOfWeek = (() => {
    try {
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return '';
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      return `(${days[date.getDay()]})`;
    } catch {
      return '';
    }
  })();

  // Form submission - convert form data to API params
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
    
    setApiSearchParams(params);
  };

  // Reset form
  const handleReset = () => {
    reset(getDefaultFormValues());
    setApiSearchParams(null);
  };

  // Print functionality
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Web稼働表_${apiSearchParams?.searchDate ? new Date(apiSearchParams.searchDate).toLocaleDateString('ja-JP') : ''}`,
    pageStyle: `
      @page {
        size: A3 landscape;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  if (isInitLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (initError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          初期データの読み込みに失敗しました: {initError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            35. Web稼働表
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {tableData && (
              <Button
                onClick={handlePrint}
                variant="contained"
                color="secondary"
                startIcon={<PrintIcon />}
                size="small"
                className="no-print"
              >
                印刷
              </Button>
            )}
            <Button component={Link} href="/menu" variant="outlined" size="small" className="no-print">
              ← メニューに戻る
            </Button>
          </Box>
        </Box>

      {/* Compact Search Form - 2 Rows + Action Row */}
      <Paper sx={{ p: 2, mb: 2 }} className="no-print">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={1.5} alignItems="flex-start">
            {/* Row 1: Date, Section, Block, Office, Class Label + 5 Class Inputs + Group Class, Vehicle Code */}
            <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
              <Controller
                name="year"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    label="日付"
                    type="date"
                    fullWidth
                    size="small"
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
                    helperText={dayOfWeek}
                    FormHelperTextProps={{ sx: { margin: 0, height: '1em', fontSize: '0.65rem' } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 1.3 }}>
              <Controller
                name="sectionCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="部"
                    fullWidth
                    size="small"
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
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 1.3 }}>
              <Controller
                name="blockCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="ブロック"
                    fullWidth
                    size="small"
                    disabled={!selectedSection || isBlocksLoading}
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
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 1.1 }}>
              <Controller
                name="officeCode"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="営業所" fullWidth size="small" />
                )}
              />
            </Grid>

            {/* Class Label + 5 Class Inputs */}
            <Grid size={{ xs: 2, sm: 1, md: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ pt: 1, fontWeight: 500, lineHeight: '40px' }}>
                クラス
              </Typography>
            </Grid>

            <Grid size={{ xs: 2, sm: 1.5, md: 0.6 }}>
              <Controller
                name="class1"
                control={control}
                render={({ field }) => (
                  <TextField {...field} placeholder="1" fullWidth size="small" />
                )}
              />
            </Grid>

            <Grid size={{ xs: 2, sm: 1.5, md: 0.6 }}>
              <Controller
                name="class2"
                control={control}
                render={({ field }) => (
                  <TextField {...field} placeholder="2" fullWidth size="small" />
                )}
              />
            </Grid>

            <Grid size={{ xs: 2, sm: 1.5, md: 0.6 }}>
              <Controller
                name="class3"
                control={control}
                render={({ field }) => (
                  <TextField {...field} placeholder="3" fullWidth size="small" />
                )}
              />
            </Grid>

            <Grid size={{ xs: 2, sm: 1.5, md: 0.6 }}>
              <Controller
                name="class4"
                control={control}
                render={({ field }) => (
                  <TextField {...field} placeholder="4" fullWidth size="small" />
                )}
              />
            </Grid>

            <Grid size={{ xs: 2, sm: 1.5, md: 0.6 }}>
              <Controller
                name="class5"
                control={control}
                render={({ field }) => (
                  <TextField {...field} placeholder="5" fullWidth size="small" />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 1.4 }}>
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
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 1.2 }}>
              <Controller
                name="vehicleTypeCode"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="車種コード" fullWidth size="small" />
                )}
              />
            </Grid>

            {/* Row 2: Deployment Division, Vehicle Division, Sort, Provisional Booking, Search Range */}
            <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
              <Controller
                name="deploymentDivision"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="配備/運用区分"
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="">全て</MenuItem>
                    {initData?.dispositionAndUsingDivisions.map((division) => (
                      <MenuItem key={division.code} value={division.code}>
                        {division.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
              <Controller
                name="vehicleDivision"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="車両区分"
                    fullWidth
                    size="small"
                    disabled={!selectedDeployment || isVehicleDivisionsLoading}
                  >
                    <MenuItem value="">全て</MenuItem>
                    {vehicleDivisions.map((division) => (
                      <MenuItem key={division.code} value={division.code}>
                        {division.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
              <Controller
                name="sortOrder"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="並び順" fullWidth size="small">
                    <MenuItem value="registration">登録番号順</MenuItem>
                    <MenuItem value="class">クラス順</MenuItem>
                    <MenuItem value="name">車名順</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.3 }}>仮引当実施</Typography>
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
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 3.9 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.3 }}>検索範囲</Typography>
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
            </Grid>

            {/* Row 3: Search Button - Right Aligned */}
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  startIcon={<SearchIcon />}
                  sx={{ minWidth: 150 }}
                  disabled={isTableLoading}
                >
                  {isTableLoading ? '検索中...' : '検索'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Results Section */}
      {apiSearchParams && (
        <>
          {isTableLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }} className="no-print">
              <CircularProgress />
            </Box>
          )}

          {tableError && (
            <Alert severity="error" sx={{ mb: 2 }} className="no-print">
              データの読み込みに失敗しました: {tableError.message}
            </Alert>
          )}

          {tableData && apiSearchParams && (
            <Box ref={printRef}>
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  表示: 1件〜{tableData.operations.length}件 (総数: {tableData.operations.length}件)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }} className="no-print">
                  💡 ステータスバーをドラッグして別の車両や時間帯へ移動できます（1時間単位）
                </Typography>
              </Box>
              <OperationTableDisplay 
                data={tableData} 
                searchParams={apiSearchParams}
                onScheduleUpdate={(update) => {
                  updateScheduleMutation.mutate(update);
                }}
              />
            </Box>
          )}
        </>
      )}
      </Container>
    </ErrorBoundary>
  );
}
