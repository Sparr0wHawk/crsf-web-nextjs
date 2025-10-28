/**
 * Shop Selection Modal Component
 * 
 * Modern implementation of the old system's nested modal approach.
 * Uses MUI Autocomplete for franchisee, prefecture, and city selection.
 * Single modal with all filters and results in one view.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Autocomplete,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useFranchisees, usePrefectures, useCities, useShopSearch } from '@/lib/hooks/useShopSelection';
import type { 
  ShopSearchParams, 
  Shop, 
  SelectedShop 
} from '@/lib/api/contracts/shopSelection.contract';
import { ShopBusinessStatus } from '@/lib/api/contracts/shopSelection.contract';

interface ShopSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (shop: SelectedShop) => void;
  title?: string;
}

export function ShopSelectionModal({ 
  open, 
  onClose, 
  onSelect,
  title = '営業所選択' 
}: ShopSelectionModalProps) {
  // Form state (removed FEE checkbox as requested)
  const [franchiseeCode, setFranchiseeCode] = useState<string | undefined>(undefined);
  const [prefectureCode, setPrefectureCode] = useState<string | undefined>(undefined);
  const [cityCode, setCityCode] = useState<string | undefined>(undefined);
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [businessStatus, setBusinessStatus] = useState<ShopBusinessStatus>(ShopBusinessStatus.NORMAL);
  const [selfServiceOnly, setSelfServiceOnly] = useState(false);
  
  // Search state
  const [searchParams, setSearchParams] = useState<ShopSearchParams | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch dropdown data
  const { data: franchisees, isLoading: loadingFranchisees } = useFranchisees();
  const { data: prefectures, isLoading: loadingPrefectures } = usePrefectures();
  const { data: cities, isLoading: loadingCities } = useCities(prefectureCode);
  
  // Search query
  const { data: searchResults, isLoading: isSearching, error: searchError } = useShopSearch(
    searchParams || {} as ShopSearchParams,
    !!searchParams
  );

  // Reset city when prefecture changes
  useEffect(() => {
    setCityCode(undefined);
  }, [prefectureCode]);

  // Handle search
  const handleSearch = () => {
    const params: ShopSearchParams = {
      franchiseeCode,
      prefectureCode,
      cityCode,
      shopName: shopName.trim() || undefined,
      address: address.trim() || undefined,
      businessStatus,
      selfServiceOnly: selfServiceOnly || undefined,
    };
    
    setSearchParams(params);
    setHasSearched(true);
  };

  // Handle clear
  const handleClear = () => {
    setFranchiseeCode(undefined);
    setPrefectureCode(undefined);
    setCityCode(undefined);
    setShopName('');
    setAddress('');
    setBusinessStatus(ShopBusinessStatus.NORMAL);
    setSelfServiceOnly(false);
    setSearchParams(null);
    setHasSearched(false);
  };

  // Handle shop selection
  const handleSelectShop = (shop: Shop) => {
    const selectedShop: SelectedShop = {
      code: shop.code,
      name: shop.name,
      address: shop.address,
    };
    onSelect(selectedShop);
    onClose();
  };

  // Handle modal close
  const handleClose = () => {
    handleClear();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Search Filters Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            📋 検索条件
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Row 1: Franchisee, Prefecture, City */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={franchisees || []}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.code}
                value={franchisees?.find(f => f.code === franchiseeCode) || null}
                onChange={(_, newValue) => setFranchiseeCode(newValue?.code)}
                loading={loadingFranchisees}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="フランチャイジー" 
                    size="small"
                    placeholder="全て"
                  />
                )}
              />

              <Autocomplete
                sx={{ flex: 1 }}
                options={prefectures || []}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.code}
                value={prefectures?.find(p => p.code === prefectureCode) || null}
                onChange={(_, newValue) => setPrefectureCode(newValue?.code)}
                loading={loadingPrefectures}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="都道府県" 
                    size="small"
                    placeholder="全て"
                  />
                )}
              />

              <Autocomplete
                sx={{ flex: 1 }}
                options={cities || []}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.code}
                value={cities?.find(c => c.code === cityCode) || null}
                onChange={(_, newValue) => setCityCode(newValue?.code)}
                loading={loadingCities}
                disabled={!prefectureCode}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="市区" 
                    size="small"
                    placeholder={prefectureCode ? "選択してください" : "都道府県を選択"}
                  />
                )}
              />
            </Box>

            {/* Row 3: Shop Name, Address */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="営業所名"
                size="small"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="全角（部分一致）"
              />

              <TextField
                sx={{ flex: 1 }}
                label="住所"
                size="small"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="全角（部分一致）"
              />
            </Box>

            {/* Row 4: Business Status, Self-Service */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                sx={{ flex: 1 }}
                select
                label="営業状態"
                size="small"
                value={businessStatus}
                onChange={(e) => setBusinessStatus(e.target.value as ShopBusinessStatus)}
              >
                <MenuItem value="1">1：通常</MenuItem>
                <MenuItem value="2">2：休業</MenuItem>
                <MenuItem value="3">3：停止</MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Checkbox 
                    checked={selfServiceOnly} 
                    onChange={(e) => setSelfServiceOnly(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">セルフ取扱営業所のみ表示する</Typography>}
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClear}
                size="small"
              >
                クリア
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? '検索中...' : '検索'}
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Search Results Section */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              📊 検索結果
              {hasSearched && searchResults && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {searchResults.totalCount}件
                </Typography>
              )}
            </Typography>
          </Box>

          {/* Loading State */}
          {isSearching && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error State */}
          {searchError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              検索に失敗しました: {searchError.message}
            </Alert>
          )}

          {/* No Search Yet */}
          {!hasSearched && !isSearching && (
            <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
              <Typography variant="body2">
                検索条件を入力して「検索」ボタンをクリックしてください
              </Typography>
            </Box>
          )}

          {/* No Results */}
          {hasSearched && !isSearching && searchResults?.totalCount === 0 && (
            <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
              <Typography variant="body2">
                該当する営業所が見つかりませんでした
              </Typography>
            </Box>
          )}

          {/* Results Table */}
          {hasSearched && searchResults && searchResults.totalCount > 0 && (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: 80 }}>No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: 100 }}>コード</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>営業所名</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>フランチャイジー</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>住所</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: 100 }}>営業状態</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: 80 }}>セルフ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.shops.map((shop, index) => (
                    <TableRow
                      key={shop.code}
                      hover
                      onClick={() => handleSelectShop(shop)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{shop.code}</TableCell>
                      <TableCell>{shop.name}</TableCell>
                      <TableCell>{shop.franchiseeName}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{shop.address}</TableCell>
                      <TableCell>
                        {shop.businessStatus === '1' ? '通常' : 
                         shop.businessStatus === '2' ? '休業' : '停止'}
                      </TableCell>
                      <TableCell>{shop.isSelfService ? '○' : ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}
