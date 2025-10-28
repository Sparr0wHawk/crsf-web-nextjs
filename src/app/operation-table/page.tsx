'use client';

import { useState, useRef } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ShopSelectionModal } from '@/components/ShopSelectionModal';
import { OperationTableSearchForm } from '@/features/operation-table/components/OperationTableSearchForm';
import { OperationTableDisplay } from '@/features/operation-table/components/OperationTableDisplay';
import { useOperationTableInit, useOperationTableData, useUpdateSchedule } from '@/features/operation-table/hooks';
import type { SearchParams, ScheduleUpdate } from '@/lib/api/contracts/operationTable.contract';
import type { SelectedShop } from '@/lib/api/contracts/shopSelection.contract';

export default function OperationTablePage() {
  const [apiSearchParams, setApiSearchParams] = useState<SearchParams | null>(null);
  const [shopModalOpen, setShopModalOpen] = useState(false);
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

  // Event handlers
  const handleSearch = (params: SearchParams) => {
    setApiSearchParams(params);
  };

  const handleShopSelect = (shop: SelectedShop) => {
    setShopModalOpen(false);
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

        {/* Search Form - Now componentized! */}
        <OperationTableSearchForm
          onSearch={handleSearch}
          onOpenShopModal={() => setShopModalOpen(true)}
          onShopSelect={handleShopSelect}
          isLoading={isTableLoading}
        />

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
                  onScheduleUpdate={(update: ScheduleUpdate) => {
                    updateScheduleMutation.mutate(update);
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* Shop Selection Modal */}
        <ShopSelectionModal
          open={shopModalOpen}
          onClose={() => setShopModalOpen(false)}
          onSelect={handleShopSelect}
        />
      </Container>
    </ErrorBoundary>
  );
}
