import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Failed to load statutory data',
  message = 'An error occurred while communicating with the central BhoomiSetu registry.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`p-8 text-center bg-red-50/50 rounded-xl border border-red-200 flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-red-900">{title}</h4>
        <p className="text-xs text-red-700 max-w-sm mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Retry Request
        </Button>
      )}
    </div>
  );
}
