import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <Header title={title} />
        </div>
        
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
