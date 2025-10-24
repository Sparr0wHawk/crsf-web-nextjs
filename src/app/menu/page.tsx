'use client';

import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button,
  Grid
} from '@mui/material';
import Link from 'next/link';
import { 
  Dashboard as DashboardIcon, 
  DirectionsCar as CarIcon,
  EventNote as ReservationIcon,
  LocalShipping as DepartureIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

export default function MenuPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            業務選択メニュー
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            作業: 会社:R1(7352) 担当者:H Y R O 閲覧:営業 0 7
          </Typography>
        </Box>

        {/* Menu Cards */}
        <Grid container spacing={3}>
          {/* 予約 Section */}
          <Grid size={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              ■予約
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', opacity: 0.6 }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReservationIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" component="h2" color="text.secondary">
                      予約
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    予約管理機能
                  </Typography>
                  <Button variant="outlined" disabled fullWidth sx={{ mt: 'auto' }}>
                    Coming Soon
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 出発 Section */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              ■出発
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', opacity: 0.6 }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DepartureIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" component="h2" color="text.secondary">
                      出発
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    出発処理
                  </Typography>
                  <Button variant="outlined" disabled fullWidth sx={{ mt: 'auto' }}>
                    Coming Soon
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* そのほか Section */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              ■そのほか
            </Typography>
          </Grid>

          {/* Operation Table Card - Main Feature */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                border: 2,
                borderColor: 'primary.main',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CarIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" component="h2">
                      35. Web稼働表
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    車両の稼働状況を時系列グラフで表示・管理します。
                    ドラッグ&ドロップでスケジュール調整が可能です。
                  </Typography>

                  <Button
                    variant="contained"
                    component={Link}
                    href="/operation-table"
                    fullWidth
                    sx={{ mt: 'auto' }}
                  >
                    開く
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 債権 Section */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              ■債権
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', opacity: 0.6 }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" component="h2" color="text.secondary">
                      40. 予約申込金
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    予約申込金の登録・管理機能
                  </Typography>
                  <Button variant="outlined" disabled fullWidth sx={{ mt: 'auto' }}>
                    Coming Soon
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', opacity: 0.6 }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" component="h2" color="text.secondary">
                      41. 予約申込金一覧
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    予約申込金の一覧表示・検索機能
                  </Typography>
                  <Button variant="outlined" disabled fullWidth sx={{ mt: 'auto' }}>
                    Coming Soon
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Back to Home */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            component={Link}
            href="/"
            variant="text"
          >
            ← ホームに戻る
          </Button>
        </Box>

        {/* POC Info */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            POC Version - 稼働表機能のみ実装中
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Mock API Mode: Enabled
          </Typography>
        </Box>

        {/* Footer */}
        <Box 
          sx={{ 
            mt: 6,
            pt: 3,
            pb: 3,
            borderTop: 1,
            borderColor: 'divider',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © Nippon Rent-A-Car Service, Inc.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
