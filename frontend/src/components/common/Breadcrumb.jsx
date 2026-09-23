import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-gov-navy font-medium transition-colors"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            {isLast || !item.to ? (
              <span className="font-bold text-slate-800" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-gov-navy font-medium transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
