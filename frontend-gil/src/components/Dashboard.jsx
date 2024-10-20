import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Package, DollarSign, TrendingDown, Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { parseISO, format } from 'date-fns';
import { authenticatedFetch } from './apiUtils';

const Dashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [stockMovement, setStockMovement] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy HH:mm:ss');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [items, lowStock, value, movement, notifs] = await Promise.all([
          authenticatedFetch('http://localhost:5060/api/items', {}, navigate),
          authenticatedFetch('http://localhost:5060/api/analytics/low-stock', {}, navigate),
          authenticatedFetch('http://localhost:5060/api/analytics/inventory-value', {}, navigate),
          authenticatedFetch('http://localhost:5060/api/analytics/stock-movement', {}, navigate),
          authenticatedFetch('http://localhost:5060/api/notifications', {}, navigate)
        ]);

        setInventoryData(items);
        setLowStockItems(lowStock);
        setInventoryValue(value.total_inventory_value);
        setStockMovement(movement);
        setNotifications(notifs);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const removeNotification = async (notificationId) => {
    try {
      await authenticatedFetch(
        `http://localhost:5060/api/notifications/${notificationId}`,
        { method: 'DELETE' },
        navigate
      );
      setNotifications(notifications.filter(notification => notification._id !== notificationId));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  }

  const filteredItems = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === '' || item.category === filterCategory) &&
    (filterDate === '' || new Date(item.updated_at).toDateString() === new Date(filterDate).toDateString())
  );

  const categories = [...new Set(inventoryData.map(item => item.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const categoryData = inventoryData.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A52A2A', '#808080', '#FFD700'];

  return (
    <div className="flex flex-col md:flex-row">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-indigo-800 text-white p-2 rounded-md"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar with mobile responsiveness */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="w-full md:ml-64 p-4 md:p-8 bg-gray-100 min-h-screen">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 mt-12 md:mt-0">Inventory Dashboard</h1>

        {/* Search and Filter - Mobile Responsive */}
        <div className="mb-4 md:mb-8 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md w-full md:w-auto"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-md w-full md:w-auto"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border rounded-md w-full md:w-auto"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Items</h3>
              <Package className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">{inventoryData.length}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Value</h3>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">${inventoryValue.toLocaleString()}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Low Stock Items</h3>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Categories</h3>
              <Menu className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">{Object.keys(categoryData).length}</div>
          </div>
        </div>

        {/* Charts - Mobile Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Category Distribution Pie Chart */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Bar Chart */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Items by Category</h3>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(categoryData).map(([category, count]) => ({
                  category,
                  count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Number of Items" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Low Stock Alert - Mobile Responsive */}
        {lowStockItems.length > 0 && (
          <div className="mt-4 md:mt-8">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Low Stock Alert</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 bg-red-50 border border-red-200 rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <div>
                        <span className="font-semibold">{item.name}</span>
                        <br />
                        Current stock: {item.quantity}
                        <br />
                        Minimum required: {item.minimum_stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Table - Mobile Responsive with Horizontal Scroll */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-4 md:mb-8 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Inventory Items</h3>
          <div className="min-w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.name}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.category}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{new Date(item.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications - Mobile Responsive */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          {notifications.map((notification) => (
            <div key={notification._id} className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex justify-between items-center">
              <div>
                <p>{notification.message}</p>
                <p className="text-sm text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => removeNotification(notification._id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;