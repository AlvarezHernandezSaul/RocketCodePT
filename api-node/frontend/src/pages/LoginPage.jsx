import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Lock, Mail, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error?.lockTimeRemaining) {
      setLockTimeRemaining(error.lockTimeRemaining);
      const timer = setInterval(() => {
        setLockTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Login
        await login(formData.email, formData.password);
        navigate('/projects');
      } else {
        // Register
        await register(formData.email, formData.password, formData.name);
        navigate('/projects');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError({
        error: err.message || 'Error al procesar la solicitud',
        remainingAttempts: err.remainingAttempts,
        lockTimeRemaining: err.lockTimeRemaining
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Contenedor Principal */}
      <div className="w-full max-w-md sm:max-w-lg">
        
        {/* Tarjeta */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden">
          
          {/* Header Section */}
          <div className="px-8 pt-12 pb-8 text-center border-b border-slate-100">
            {/* Icono */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg shadow-slate-900/20 mb-6">
              <Lock className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            
            {/* Título */}
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {isLogin ? "Bienvenido de nuevo" : "Crear cuenta"}
            </h1>
            <p className="text-base text-slate-600">
              {isLogin ? "Ingresa tus credenciales para continuar" : "Completa el formulario para registrarte"}
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Campo Nombre */}
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2.5">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" strokeWidth={2} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Juan Pérez"
                      className="w-full h-14 pl-12 pr-4 text-base border-2 border-slate-200 rounded-2xl bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none placeholder:text-slate-400"
                      aria-label="Nombre completo"
                    />
                  </div>
                </div>
              )}

              {/* Campo Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" strokeWidth={2} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className="w-full h-14 pl-12 pr-4 text-base border-2 border-slate-200 rounded-2xl bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none placeholder:text-slate-400"
                    aria-label="Correo electrónico"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" strokeWidth={2} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-14 text-base border-2 border-slate-200 rounded-2xl bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none placeholder:text-slate-400"
                    aria-label="Contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors p-1"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Mensaje de Error */}
              {error && (
                <div 
                  className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-red-900 mb-1">{error.error}</p>
                      
                      {error.remainingAttempts !== undefined && (
                        <p className="text-red-700">
                          Intentos restantes: <span className="font-medium">{error.remainingAttempts}</span>
                        </p>
                      )}
                      
                      {lockTimeRemaining > 0 && (
                        <p className="text-red-700 mt-1">
                          Cuenta bloqueada por: <span className="font-medium">{formatTime(lockTimeRemaining)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={isLoading || lockTimeRemaining > 0}
                className="w-full h-14 bg-slate-900 text-white text-base font-semibold rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                aria-label={isLogin ? "Iniciar sesión" : "Crear cuenta"}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : isLogin ? (
                  "Iniciar sesión"
                ) : (
                  "Crear cuenta"
                )}
              </button>

            </form>
          </div>

          {/* Footer Section */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600 mb-2">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setLockTimeRemaining(0);
                setFormData({ email: "", password: "", name: "" });
              }}
              className="text-base font-semibold text-slate-900 hover:text-slate-700 underline underline-offset-4 decoration-2 transition-colors"
              aria-label={isLogin ? "Ir a crear cuenta" : "Ir a iniciar sesión"}
            >
              {isLogin ? "Crear una cuenta nueva" : "Iniciar sesión"}
            </button>
          </div>

        </div>

        {/* Texto legal (opcional) */}
        <p className="text-center text-xs text-slate-500 mt-6 px-8">
          Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  );
};

export default LoginPage;