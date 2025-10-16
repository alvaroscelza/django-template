import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Accounts from './pages/Accounts';
import Concepts from './pages/Concepts';
import Transactions from './pages/Transactions';
import Dashboard from './pages/Dashboard';
import FinancialStrategyReport from './pages/FinancialStrategy';
import GoogleAuth from './pages/GoogleAuth';
import Investments from './pages/Investments';
import Tutorials from './pages/Tutorials';

function Layout({ user, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Panel', path: '/', icon: 'fas fa-tachometer-alt' },
        { name: 'Transacciones', path: '/transactions', icon: 'fas fa-exchange-alt' },
        { name: 'Cuentas', path: '/accounts', icon: 'fas fa-wallet' },
        { name: 'Conceptos', path: '/concepts', icon: 'fas fa-tags' },
        { name: 'Inversiones', path: '/investments', icon: 'fas fa-coins' },
        { name: 'Estrategia Financiera', path: '/financial-strategy', icon: 'fas fa-chart-pie' },
        { name: 'Tutoriales', path: '/tutorials', icon: 'fas fa-video' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile menu button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="bg-white p-2 rounded-md shadow-md"
                >
                    <i className="fas fa-bars"></i>
                </button>
            </div>

            {/* Collapse toggle button (outside sidebar when collapsed) */}
            {sidebarCollapsed && (
                <div style={{ position: 'fixed', left: '85px', top: '15px', zIndex: 1000 }} className="hidden md:block">
                    <button
                        onClick={() => setSidebarCollapsed(false)}
                        style={{ 
                            backgroundColor: 'white', 
                            padding: '8px', 
                            borderRadius: '50%', 
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Expandir menú"
                    >
                        <i className="fas fa-angle-right"></i>
                    </button>
                </div>
            )}

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="app-header">
                    <h1 className="app-title">
                        <i className="fas fa-chart-line"></i>
                        <span className="app-title-text">FinApp</span>
                    </h1>
                    <div className="sidebar-controls">
                        {!sidebarCollapsed && (
                            <button
                                onClick={() => setSidebarCollapsed(true)}
                                className="collapse-toggle hidden md:block text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                                title="Colapsar menú"
                            >
                                <i className="fas fa-angle-left"></i>
                            </button>
                        )}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navigation.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-nav-item ${
                                location.pathname === item.path ? 'active' : ''
                            }`}
                            title={sidebarCollapsed ? item.name : ''}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <i className={`${item.icon} ${sidebarCollapsed ? '' : 'mr-3'}`}></i>
                            <span className={`nav-item-text ${sidebarCollapsed ? 'hidden' : ''}`}>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="user-profile">
                    <div className="user-avatar">
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user.username}</div>
                        <div className="user-email">{user.email}</div>
                    </div>
                </div>
                <div className="user-logout">
                    <button
                        onClick={onLogout}
                        className="text-gray-400 hover:text-red-500 transition-colors w-full text-left py-2 px-4"
                        title="Cerrar Sesión"
                    >
                        <i className={`fas fa-sign-out-alt ${sidebarCollapsed ? '' : 'mr-2'}`}></i> 
                        <span className="logout-text">Cerrar Sesión</span>
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <Routes>
                    <Route path="/" element={<Dashboard user={user} />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/concepts" element={<Concepts />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/investments" element={<Investments />} />
                    <Route path="/financial-strategy" element={<FinancialStrategyReport />} />
                    <Route path="/tutorials" element={<Tutorials />} />
                </Routes>
            </div>
        </div>
    );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in URL params (from OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');

        if (urlToken) {
            // Save token and clean URL
            localStorage.setItem('auth_token', urlToken);
            window.history.replaceState({}, document.title, window.location.pathname);

            // Decode token to get user info
            try {
                const payload = JSON.parse(atob(urlToken.split('.')[1]));
                const userData = { 
                    email: payload.sub,
                    username: payload.sub.split('@')[0] // Extract username from email
                };
                localStorage.setItem('user_data', JSON.stringify(userData));
                setUser(userData);
            } catch (e) {
                console.error('Failed to decode token:', e);
                // Clear invalid token
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
            }
        } else {
            // Check existing stored token
            const token = localStorage.getItem('auth_token');
            const userData = localStorage.getItem('user_data');

            if (token && userData) {
                try {
                    const parsedUserData = JSON.parse(userData);
                    setUser(parsedUserData);
                } catch (e) {
                    console.error('Failed to parse stored user data:', e);
                    // Clear invalid data
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_data');
                }
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData.user);
        localStorage.setItem('auth_token', userData.access_token);
        localStorage.setItem('refresh_token', userData.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(userData.user));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <GoogleAuth onLogin={handleLogin} />;
    }

    return (
        <Router>
            <Layout user={user} onLogout={handleLogout} />
        </Router>
    );
}