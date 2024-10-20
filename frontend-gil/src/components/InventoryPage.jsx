import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Edit, Trash2, Plus, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const InventoryPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    minimum_stock: 0,
    unit_price: 0,
    location: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5060/api/items', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5060/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      //   const data = await response.json();
      const data = ['Writing Tools', 'Paper Products', 'Organization Tools', 'Technology Accessories', 'Office Furniture', 'Cleaning Supplies', 'Breakroom Supplies']
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5060/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newItem)
      });
      if (!response.ok) throw new Error('Failed to add item');
      await fetchItems();
      setIsAddingItem(false);
      setNewItem({ name: '', category: '', quantity: 0, minimum_stock: 0, unit_price: 0, location: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5060/api/items/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editingItem)
      });
      if (!response.ok) throw new Error('Failed to update item');
      await fetchItems();
      setEditingItem(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`http://localhost:5060/api/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to delete item');
        await fetchItems();
      } catch (err) {
        setError(err.message);
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 mt-12 md:mt-0">Inventory Management</h1>

        {/* Add New Item Button */}
        <button
          className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          onClick={() => setIsAddingItem(true)}
        >
          <Plus className="mr-2" /> Add New Item
        </button>

        {/* Add New Item Form - Mobile Responsive */}
        {isAddingItem && (
          <form onSubmit={handleAddItem} className="mb-4 md:mb-8 bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className='w-full'>
                <p>Quantity</p>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className='w-full'>
                <p>Minimum Stock</p>
                <input
                  type="number"
                  placeholder="Minimum Stock"
                  value={newItem.minimum_stock}
                  onChange={(e) => setNewItem({ ...newItem, minimum_stock: parseInt(e.target.value) })}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className='w-full'>
                <p>Unit Price</p>
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) })}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className='w-full'>
                <p>Add Location</p>
                <input
                  type="text"
                  placeholder="Location"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>
            <div className="mt-4">
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
                Add Item
              </button>
              <button type="button" onClick={() => setIsAddingItem(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Inventory Table - Mobile Responsive with Horizontal Scroll */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">Inventory Items</h2>
          <div className="min-w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Minimum Stock</th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.name}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.category}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.minimum_stock}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">${item.unit_price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.location}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <button onClick={() => setEditingItem(item)} className="text-blue-600 hover:text-blue-900 mr-2">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDeleteItem(item._id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Item Modal - Mobile Responsive */}
        {editingItem && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full p-4">
            <div className="relative top-20 mx-auto p-4 md:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit Item</h3>
              <form onSubmit={handleEditItem}>
                <input
                  type="text"
                  placeholder="Name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="border p-2 rounded w-full mb-2"
                  required
                />
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="border p-2 rounded w-full mb-2"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })}
                  className="border p-2 rounded w-full mb-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Minimum Stock"
                  value={editingItem.minimum_stock}
                  onChange={(e) => setEditingItem({ ...editingItem, minimum_stock: parseInt(e.target.value) })}
                  className="border p-2 rounded w-full mb-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={editingItem.unit_price}
                  onChange={(e) => setEditingItem({ ...editingItem, unit_price: parseFloat(e.target.value) })}
                  className="border p-2 rounded w-full mb-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={editingItem.location}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                  className="border p-2 rounded w-full mb-4"
                />
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setEditingItem(null)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;