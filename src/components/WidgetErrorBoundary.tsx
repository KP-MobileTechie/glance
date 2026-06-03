'use client';
import { Component, type ReactNode } from 'react';

export interface WidgetErrorBoundaryProps {
  children: ReactNode;
  title?: string;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState> {
  state: WidgetErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[WidgetErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm" style={{ color: 'var(--glance-muted)' }}>
            {this.props.title ?? 'Widget'} encountered an error
          </p>
          <button
            className="glance-chip text-xs"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
