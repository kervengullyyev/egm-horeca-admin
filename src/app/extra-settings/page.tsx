"use client";

import AdminLayout from "@/components/AdminLayout";

export default function ExtraSettingsPage() {


  return (
    <AdminLayout>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Extra Settings</h1>
            <p className="text-gray-600 mt-1">Configure advanced and optional settings for your store</p>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Maintenance mode</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-brand-primary transition-colors relative">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span>Enable email notifications</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-brand-primary transition-colors relative">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email</h2>
            <div className="grid grid-cols-1 gap-4">
              <input placeholder="Sender name" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none" />
              <input placeholder="Sender email" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none" />
              <input placeholder="SMTP host" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none" />
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Google Analytics</span>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Connect</button>
              </div>
              <div className="flex items-center justify-between">
                <span>Stripe</span>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Connect</button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">Reset or clear test data. Use with caution.</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Clear test data</button>
          </div>
        </div>
    </AdminLayout>
  );
}
