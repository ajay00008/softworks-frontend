// Test file to verify all components are working
import React from 'react';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { GradeBuckets } from './components/Analytics/GradeBuckets';
import { NotificationCenter } from './components/Notifications/NotificationCenter';

// Test component to verify all imports work
export const TestComponents = () => {
  return (
    <div>
      <h1>Component Test</h1>
      <AdminDashboard />
      <StaffDashboard />
      <GradeBuckets />
      <NotificationCenter />
    </div>
  );
};

export default TestComponents;
