import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { LogIn, Send, User, LogOut, MessageSquare } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';
const SOCKET_URL = 'http://localhost:6001';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [view, setView] = useState(token ? 'chat' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (token) {
      const newSocket = io(SOCKET_URL, {
        auth: { token }
      });

      newSocket.on('connect', () => console.log('Conectado al socket'));
      
      newSocket.on('message-history', (history) => {
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
      setView('chat');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
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

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <LogIn className="text-white w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-white mb-2">Bienvenido</h2>
          <p className="text-slate-400 text-center mb-8">Ingresa a tu cuenta para chatear</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
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
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <MessageSquare className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Chat Realtime</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full border border-slate-600">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-200">{user?.name}</span>
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

      {/* Main Chat Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl flex flex-col overflow-hidden">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-600">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <MessageSquare className="w-12 h-12 opacity-20" />
                <p>No hay mensajes aún. ¡Sé el primero!</p>
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
                      <p className={`text-[9px] mt-1 opacity-60 text-right`}>
                        {new Date(msg.timestamp || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
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
                className="bg-indigo-600 p-3 rounded-xl text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 active:scale-[0.95]"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
