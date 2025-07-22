// API configuration
const API_BASE_URL = window.location.origin + '/api/v1/';

// Global logout function
const forceLogout = () => {
    console.log('Forcing logout due to authentication error');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    // Clear all localStorage to be safe
    localStorage.clear();
    window.location.href = window.location.origin;
};

// API client
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    // Try to refresh the token
                    console.log('Attempting to refresh token...');
                    // Use axios directly to avoid interceptor recursion
                    const refreshResponse = await axios.post(`tenants/auth/google/refresh/`, {
                        refresh_token: refreshToken
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const newAccessToken = refreshResponse.data.access_token;
                    console.log('Token refreshed successfully');
                    localStorage.setItem('auth_token', newAccessToken);
                    
                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    
                    // Retry the original request
                    console.log('Retrying original request with new token');
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, logout user
                    console.log('Token refresh failed:', refreshError);
                    forceLogout();
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, logout user
                forceLogout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

// Main App Component
function App() {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [currentView, setCurrentView] = React.useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    React.useEffect(() => {
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
        setCurrentView('dashboard');
    };

    const navigation = [
        { name: 'Dashboard', key: 'dashboard', icon: 'fas fa-tachometer-alt' },
        { name: 'Libro Diario', key: 'transactions', icon: 'fas fa-exchange-alt' },
        { name: 'Cuentas', key: 'accounts', icon: 'fas fa-wallet' },
        { name: 'Conceptos', key: 'concepts', icon: 'fas fa-tags' },
        { name: 'Balances', key: 'balances', icon: 'fas fa-balance-scale' },
        { name: 'Estrategia Financiera', key: 'financial-strategy', icon: 'fas fa-chart-line' },
    ];

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

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="app-header">
                    <h1 className="app-title">
                        <i className="fas fa-chart-line"></i>
                        FinApp
                    </h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navigation.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => {
                                setCurrentView(item.key);
                                setSidebarOpen(false);
                            }}
                            className={`sidebar-nav-item ${
                                currentView === item.key ? 'active' : ''
                            }`}
                        >
                            <i className={`${item.icon} mr-3`}></i>
                            {item.name}
                        </button>
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
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-red-500 transition-colors w-full text-left py-2 px-4"
                        title="Cerrar Sesión"
                    >
                        <i className="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="main-content">
                {currentView === 'dashboard' && <Dashboard user={user} />}
                {currentView === 'accounts' && <Accounts />}
                {currentView === 'concepts' && <Concepts />}
                {currentView === 'transactions' && <Transactions />}
                {currentView === 'balances' && <BalancesReport onBack={() => setCurrentView('dashboard')} />}
                {currentView === 'financial-strategy' && <FinancialStrategyReport onBack={() => setCurrentView('dashboard')} />}
            </div>
        </div>
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);