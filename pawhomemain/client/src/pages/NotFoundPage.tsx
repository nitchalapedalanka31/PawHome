import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-20 h-20 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-soft">
        <PawPrint className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-black text-pawText">Page Not Found</h2>
      <p className="text-sm text-pawMuted max-w-sm">
        Looks like this trail leads nowhere! The page you were looking for doesn't exist or has moved.
      </p>
      <Link to="/dashboard">
        <Button icon={<ArrowLeft className="w-4 h-4" />}>Back to Home</Button>
      </Link>
    </div>
  );
};
