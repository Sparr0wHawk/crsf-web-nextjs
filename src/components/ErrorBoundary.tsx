'use client';

import { Component, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            m: 2,
            textAlign: 'center',
            bgcolor: 'error.light',
            color: 'error.contrastText',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />
            <Typography variant="h5" component="h2" gutterBottom>
              エラーが発生しました
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              申し訳ございません。予期しないエラーが発生しました。
            </Typography>
            {this.state.error && (
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'rgba(0,0,0,0.1)',
                  p: 2,
                  borderRadius: 1,
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
              >
                {this.state.error.message}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              sx={{ mt: 2 }}
            >
              ページを再読み込み
            </Button>
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}
