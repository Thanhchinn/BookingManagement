import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Cập nhật state để lần render sau hiển thị fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Bạn cũng có thể log lỗi này lên dịch vụ giám sát lỗi bên ngoài (như Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 bg-slate-900 border border-rose-900/30 rounded-2xl text-center shadow-lg backdrop-blur-md max-w-md mx-auto my-4">
            <div className="text-3xl mb-3 select-none">⚠️</div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1.5">
              Đã xảy ra sự cố
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Không thể tải hoặc hiển thị thành phần giao diện này lúc này. Vui lòng tải lại trang hoặc thử lại.
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border-0 cursor-pointer transition-colors shadow-inner"
            >
              Thử tải lại khu vực này
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
