import Link from "next/link";
import { Button, Container, Typography, Box } from "@mui/material";

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          CRS/CRF Web System
        </Typography>
        
        <Typography variant="h5" color="text.secondary" gutterBottom>
          稼働表管理システム POC
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/menu"
          >
            メニューへ
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            component={Link}
            href="/operation-table"
          >
            稼働表へ（直接）
          </Button>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            POC Version - React + Next.js + MUI + Tailwind
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Mock API Mode Enabled
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
