import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Package, LogOut, X } from 'lucide-react';

const Sidebar = ({ onClose }) => {
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="bg-indigo-800 text-white w-64 h-screen fixed left-0 top-0 overflow-y-auto z-40">
            {/* Mobile Close Button */}
            <button 
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 text-white"
            >
                <X className="h-6 w-6" />
            </button>

            <div className="p-4 mt-12 md:mt-0">
                <nav className="mt-8">
                    <ul className="space-y-2">
                        <li>
                            <button 
                                onClick={() => {
                                    navigate('/dashboard');
                                    onClose?.();
                                }} 
                                className="flex items-center space-x-2 hover:bg-indigo-700 w-full p-2 rounded"
                            >
                                <Home className="h-5 w-5" />
                                <span>Dashboard</span>
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => {
                                    navigate('/inventory');
                                    onClose?.();
                                }} 
                                className="flex items-center space-x-2 hover:bg-indigo-700 w-full p-2 rounded"
                            >
                                <Package className="h-5 w-5" />
                                <span>Inventory</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className="absolute bottom-4 w-full px-4">
                <button onClick={handleSignOut} className="flex items-center space-x-2 hover:bg-indigo-700 w-full p-2 rounded">
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;