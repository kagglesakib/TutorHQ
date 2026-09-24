'use client';

import React from 'react';
import { UserLogDatasManager } from '@/app/admin/_components';

export default function AdminApprovalsPage() {
  return (
    <div className="space-y-3 max-w-7xl mx-auto w-full px-0 sm:px-2">
      {/* Main Content Component */}
      <UserLogDatasManager />
    </div>
  );
}
