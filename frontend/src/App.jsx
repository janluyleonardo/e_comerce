import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { LogIn, Send, User, LogOut, MessageSquare, Pencil, Trash2, PlusCircle, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:6001';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'products'
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [products, setProducts] = useState([]);
   const [socket, setSocket] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const messagesEndRef = useRef(null);

  // Vista inicial basada en token
  const [view, setView] = useState(token ? 'main' : 'login');

  useEffect(() => {
    if (token) {
      const newSocket = io(SOCKET_URL, {
        auth: { token }
      });

      newSocket.on('connect', () => console.log('Conectado al socket'));
      
      newSocket.on('messages', (history) => {
        setMessages(history);
      });

      newSocket.on('message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Error de conexión socket:', err.message);
        if (err.message.includes('Token')) {
          handleLogout();
        }
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sincronizar perfil y productos
  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          // Perfil
          const resMe = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(resMe.data.user);
          localStorage.setItem('user', JSON.stringify(resMe.data.user));

          // Productos
          const resProd = await axios.get(`${API_URL}/products`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProducts(resProd.data);
        } catch (err) {
          console.error('Error fetching data:', err);
        }
      };
      fetchData();
    }
  }, [token, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      setView('main');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/signup`, { 
        name, 
        email, 
        password,
        password_confirmation: passwordConfirmation 
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      setView('main');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0][0];
        setError(firstError);
      } else {
        setError(err.response?.data?.message || 'Error al registrar usuario');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setView('login');
    if (socket) socket.disconnect();
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('new-message', newMessage);
      setNewMessage('');
    }
  };

   const handleCreateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      if (editingProduct) {
        // ACTUALIZAR
        await axios.put(`${API_URL}/products/${editingProduct.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Producto actualizado');
      } else {
        // CREAR
        await axios.post(`${API_URL}/products`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Producto creado exitosamente');
      }
      
      setEditingProduct(null);
      
      // Refrescar perfil (contador)
      const resProfile = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(resProfile.data.user);
      localStorage.setItem('user', JSON.stringify(resProfile.data.user));
      
      // Refrescar productos
      const resProducts = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(resProducts.data);
      e.target.reset();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Ocurrió un problema'));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== id));
      
      // Actualizar contador en el perfil
      const resProfile = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(resProfile.data.user);
      localStorage.setItem('user', JSON.stringify(resProfile.data.user));
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <LogIn className="text-white w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            {isSignup ? 'Crea tu cuenta' : 'Bienvenido'}
          </h2>
          <p className="text-slate-400 text-center mb-8">
            {isSignup ? 'Únete a EcoHome Store hoy mismo' : 'Ingresa a tu cuenta para entrar'}
          </p>
          
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}
            {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
            >
              {isSignup ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm">
              {isSignup ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                }}
                className="ml-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
              >
                {isSignup ? 'Inicia sesión' : 'Regístrate aquí'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <MessageSquare className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">E-Comerce</h1>
            </div>
            <nav className="flex gap-4">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`text-sm font-medium ${activeTab === 'chat' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'} transition-colors`}
              >
                Chat
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`text-sm font-medium ${activeTab === 'products' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'} transition-colors`}
              >
                Productos
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full border border-slate-600">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-200">{user?.name} ({user?.products_count || 0})</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded uppercase font-bold">{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col gap-4 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-600">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <MessageSquare className="w-12 h-12 opacity-20" />
                  <p>No hay mensajes aún.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.user_id === user?.id || msg.user === user?.name;
                  return (
                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-md ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600'
                      }`}>
                        {!isMe && <p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">{msg.user}</p>}
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className="text-[9px] mt-1 opacity-60 text-right">
                          {new Date(msg.timestamp || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-slate-800 border-t border-slate-700">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 p-3 rounded-xl text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 active:scale-[0.95]"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto content-start">
             {user?.role === 'admin' && (
              <div className="md:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl h-fit sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    {editingProduct ? <Pencil className="w-4 h-4 text-amber-400" /> : <PlusCircle className="w-4 h-4 text-indigo-400" />}
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h3>
                  {editingProduct && (
                    <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Nombre</label>
                    <input name="name" defaultValue={editingProduct?.name} key={editingProduct?.id + 'name'} placeholder="Nombre" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-indigo-500" required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Descripción</label>
                    <textarea name="description" defaultValue={editingProduct?.description} key={editingProduct?.id + 'desc'} placeholder="Descripción" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Precio</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} key={editingProduct?.id + 'price'} placeholder="Precio" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-indigo-500" required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Stock</label>
                    <input name="stock" type="number" defaultValue={editingProduct?.stock} key={editingProduct?.id + 'stock'} placeholder="Stock" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-indigo-500" required />
                  </div>
                  <button type="submit" className={`w-full ${editingProduct ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} py-2 rounded-lg text-white font-bold transition-all shadow-lg`}>
                    {editingProduct ? 'Guardar Cambios' : 'Publicar Producto'}
                  </button>
                </form>
              </div>
            )}
            <div className={`md:col-span-${user?.role === 'admin' ? '2' : '3'} space-y-4`}>
              {products.map(p => (
                 <div key={p.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-indigo-500/50 transition-all">
                  <div className="flex-1">
                    <h4 className="text-white font-bold">{p.name}</h4>
                    <p className="text-slate-400 text-xs line-clamp-1">{p.description}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-indigo-400 text-sm font-bold">${p.price}</span>
                      <span className="text-slate-500 text-xs">Stock: {p.stock}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Creado por</p>
                      <p className="text-indigo-300 text-sm italic">{p.creator?.name || 'Sistema'}</p>
                    </div>
                    
                    {user?.role === 'admin' && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingProduct(p)}
                          className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
