'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 rounded-xl border border-destructive/20 bg-destructive/10 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Đã xảy ra lỗi không mong muốn</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              {this.state.error?.message || 'Không thể tải thành phần này. Vui lòng thử lại sau.'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Thử lại
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
