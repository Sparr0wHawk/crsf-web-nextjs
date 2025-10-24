/**
 * Vehicle Reservation Search Page
 * 
 * Demonstrates how to use the Vehicle Reservation API
 */

'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  useShops,
  useVehicleClasses,
  useReservationSearch,
  useCancelReservation,
} from '@/lib/hooks/useVehicleReservation';
import type {
  ReservationSearchParams,
  ReservationStatus,
} from '@/lib/api/contracts/vehicleReservation.contract';

export default function ReservationSearchPage() {
  // ============================================================================
  // State Management
  // ============================================================================

  const [searchParams, setSearchParams] = useState<ReservationSearchParams>({
    startDate: new Date(),
    endDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    })(),
  });

  // ============================================================================
  // API Hooks
  // ============================================================================

  const { data: shops, isLoading: shopsLoading } = useShops();
  const { data: vehicleClasses, isLoading: classesLoading } = useVehicleClasses();
  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
    refetch,
  } = useReservationSearch(searchParams);
  const cancelMutation = useCancelReservation();

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleSearch = () => {
    refetch();
  };

  const handleCancel = async (reservationId: string) => {
    if (!confirm('本当にキャンセルしますか？')) return;

    try {
      await cancelMutation.mutateAsync({
        reservationId,
        reason: 'User cancelled from UI',
      });
      alert('予約をキャンセルしました');
    } catch (error) {
      alert('キャンセルに失敗しました');
    }
  };

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const getStatusColor = (status: ReservationStatus) => {
    const colors: Record<ReservationStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      pending: 'warning',
      confirmed: 'primary',
      'in-use': 'success',
      completed: 'default',
      cancelled: 'error',
    };
    return colors[status];
  };

  const getStatusLabel = (status: ReservationStatus) => {
    const labels: Record<ReservationStatus, string> = {
      pending: '保留中',
      confirmed: '確定',
      'in-use': '利用中',
      completed: '完了',
      cancelled: 'キャンセル',
    };
    return labels[status];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        予約検索
      </Typography>

      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          検索条件
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
          {/* Start Date */}
          <TextField
            label="開始日"
            type="date"
            value={searchParams.startDate.toISOString().split('T')[0]}
            onChange={(e) =>
              setSearchParams({ ...searchParams, startDate: new Date(e.target.value) })
            }
            InputLabelProps={{ shrink: true }}
          />

          {/* End Date */}
          <TextField
            label="終了日"
            type="date"
            value={searchParams.endDate.toISOString().split('T')[0]}
            onChange={(e) =>
              setSearchParams({ ...searchParams, endDate: new Date(e.target.value) })
            }
            InputLabelProps={{ shrink: true }}
          />

          {/* Customer Name */}
          <TextField
            label="顧客名"
            value={searchParams.customerName || ''}
            onChange={(e) =>
              setSearchParams({ ...searchParams, customerName: e.target.value })
            }
          />

          {/* Status */}
          <FormControl>
            <InputLabel>ステータス</InputLabel>
            <Select
              value={searchParams.status || ''}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  status: e.target.value as ReservationStatus | undefined,
                })
              }
            >
              <MenuItem value="">すべて</MenuItem>
              <MenuItem value="pending">保留中</MenuItem>
              <MenuItem value="confirmed">確定</MenuItem>
              <MenuItem value="in-use">利用中</MenuItem>
              <MenuItem value="completed">完了</MenuItem>
              <MenuItem value="cancelled">キャンセル</MenuItem>
            </Select>
          </FormControl>

          {/* Shop */}
          <FormControl disabled={shopsLoading}>
            <InputLabel>営業所</InputLabel>
            <Select
              value={searchParams.shopCode || ''}
              onChange={(e) =>
                setSearchParams({ ...searchParams, shopCode: e.target.value })
              }
            >
              <MenuItem value="">すべて</MenuItem>
              {shops?.map((shop) => (
                <MenuItem key={shop.code} value={shop.code}>
                  {shop.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Vehicle Class */}
          <FormControl disabled={classesLoading}>
            <InputLabel>車両クラス</InputLabel>
            <Select
              value={searchParams.classCode || ''}
              onChange={(e) =>
                setSearchParams({ ...searchParams, classCode: e.target.value })
              }
            >
              <MenuItem value="">すべて</MenuItem>
              {vehicleClasses?.map((vc) => (
                <MenuItem key={vc.code} value={vc.code}>
                  {vc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button variant="contained" onClick={handleSearch} disabled={searchLoading}>
          {searchLoading ? <CircularProgress size={24} /> : '検索'}
        </Button>
      </Paper>

      {/* Error Display */}
      {searchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          エラーが発生しました: {(searchError as Error).message}
        </Alert>
      )}

      {/* Results */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">
            検索結果: {searchResults?.totalCount || 0}件
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>予約番号</TableCell>
                <TableCell>顧客名</TableCell>
                <TableCell>車両</TableCell>
                <TableCell>貸出日時</TableCell>
                <TableCell>返却日時</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>金額</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : searchResults?.reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    該当する予約がありません
                  </TableCell>
                </TableRow>
              ) : (
                searchResults?.reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>{reservation.reservationNumber}</TableCell>
                    <TableCell>{reservation.customer.name}</TableCell>
                    <TableCell>
                      {reservation.vehicle.carName}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {reservation.vehicle.registNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(reservation.rental.startTime)}</TableCell>
                    <TableCell>{formatDate(reservation.rental.endTime)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(reservation.status)}
                        color={getStatusColor(reservation.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>¥{reservation.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      {reservation.status !== 'cancelled' &&
                        reservation.status !== 'completed' && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleCancel(reservation.id)}
                            disabled={cancelMutation.isPending}
                          >
                            キャンセル
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
