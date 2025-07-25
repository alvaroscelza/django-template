import React from 'react';
import axios from 'axios';

function GoogleAuth({ onLogin }) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            // Get Google OAuth URL from backend
            const response = await axios.get('/tenants/auth/google/login/');

            // Redirect directly to Google OAuth
            window.location.href = response.data.auth_url;
        } catch (err) {
            setError('Error al inicializar la autenticación de Google: ' + (err.response?.data?.error || err.message));
            setLoading(false);
        }
    };

    // Check for OAuth callback when component mounts
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const error = urlParams.get('error');

        if (error) {
            setError('La autenticación de Google falló: ' + error);
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (accessToken) {
            // Handle successful authentication from URL parameters
            handleAuthSuccess(urlParams);
        }
    }, []);

        const handleAuthSuccess = (urlParams) => {
        setLoading(true);
        setError('');
        
        try {
            const authData = {
                access_token: urlParams.get('access_token'),
                refresh_token: urlParams.get('refresh_token'),
                token_type: urlParams.get('token_type'),
                user: {
                    id: urlParams.get('user_id'),
                    email: urlParams.get('email')
                }
            };

            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);

            onLogin(authData);
        } catch (err) {
            setError('Error al procesar la autenticación: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                        <i className="fas fa-chart-line text-blue-600 text-xl"></i>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Bienvenido a FinApp
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Gestiona tus finanzas con privacidad y seguridad completas
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <i className="fas fa-exclamation-circle text-red-400"></i>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            {loading ? (
                                <i className="fas fa-spinner fa-spin text-gray-400"></i>
                            ) : (
                                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                        </span>
                        {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Al continuar, aceptas nuestros términos de servicio y política de privacidad.
                        <br />
                        Tus datos son completamente privados y están aislados en tu propio espacio de trabajo seguro.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default GoogleAuth;