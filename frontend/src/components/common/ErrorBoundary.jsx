import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gov-bg flex flex-col items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-xl p-8 border border-red-200 shadow-gov text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Application Error Encountered</h2>
              <p className="text-xs text-slate-500 mt-1">
                An unexpected condition was trapped by the BhoomiSetu National Portal error supervisor.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-red-50 rounded-lg text-left text-[11px] font-mono text-red-800 break-words">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex space-x-2 pt-2 justify-center">
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={this.handleReset}>
                Attempt Recovery
              </Button>
              <Button variant="primary" size="sm" onClick={this.handleReload}>
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
