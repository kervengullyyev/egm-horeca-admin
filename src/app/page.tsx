"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp,
  DollarSign,
  Package,
  ClipboardList,
  Users,
  FolderOpen
} from "lucide-react";
import { api, DashboardStats } from "@/lib/api";
import ProtectedPage from "@/components/ProtectedPage";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const dashboardStats = await api.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Fallback to static data if API fails
        setStats({
          total_revenue: 45231.89,
          total_products: 318,
          total_orders: 156,
          total_customers: 156,
          pending_orders: 24
        });
      }
    };

    fetchDashboardStats();
  }, []);


  const summaryCards = [
    {
      title: "Total Revenue",
      value: stats ? `${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON` : "0.00 RON",
      change: "+20.1% from last month",
      button: "View Orders",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Products",
      value: stats ? stats.total_products.toString() : "0",
      change: "+12 new this month",
      button: "Manage Products",
      icon: Package,
      color: "text-brand-primary"
    },
    {
      title: "Orders",
      value: stats ? stats.total_orders.toString() : "0",
      change: "+8% from last month",
      button: "View Orders",
      icon: ClipboardList,
      color: "text-purple-600",
      badge: stats ? `${stats.pending_orders} Pending` : "0 Pending"
    },
    {
      title: "Customers",
      value: stats ? stats.total_customers.toString() : "0",
      change: "+5 new this week",
      button: "View Customers",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  const quickActions = [
    { label: "Categories", icon: FolderOpen, color: "text-brand-primary", href: "/categories" },
    { label: "Products", icon: Package, color: "text-green-600", href: "/products" },
    { label: "Orders", icon: ClipboardList, color: "text-purple-600", href: "/orders" },
    { label: "Users", icon: Users, color: "text-orange-600", href: "/users" }
  ];

  const recentActivity = [
    { action: "New order placed", detail: "Restaurant ABC · 2 minutes ago" },
    { action: "Product updated", detail: "Premium Coffee Beans · 5 minutes ago" },
    { action: "New customer registered", detail: "Cafe XYZ · 10 minutes ago" },
    { action: "Order shipped", detail: "#ORD-2024-001 · 15 minutes ago" }
  ];

  return (
    <ProtectedPage>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            					<p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryCards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-gray-100 ${card.color}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  {card.badge && (
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {card.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
                <p className="text-sm text-gray-500 mb-4">{card.change}</p>
                                  <Link
                    href={card.button === "View Orders" ? "/orders" : 
                          card.button === "Manage Products" ? "/products" : 
                          card.button === "View Customers" ? "/users" : "#"}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-brand-primary hover:text-brand-primary-hover hover:bg-brand-primary-light rounded-lg transition-colors"
                  >
                  {card.button}
                </Link>
              </div>
            ))}
          </div>

          {/* Sales Overview and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  						<span className="text-gray-600">Today&apos;s Sales</span>
                  <span className="font-semibold text-gray-900">$2,847.32</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold text-gray-900">$18,492.10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-gray-900">$45,231.89</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">+12.5% from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-3 rounded-lg bg-gray-100 ${action.color} mb-3`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
    </ProtectedPage>
  );
}
