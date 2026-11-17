import { useState } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';

// Reemplaza con la Public IPv4 de tu instancia EC2
const API_URL = 'https://fd0dbd5cw9.execute-api.us-east-1.amazonaws.com/';

function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Hola! Soy tu asesor virtual de Seguros Horizonte Vida. ¿En qué puedo ayudarte hoy sobre nuestras pólizas (Plan Esencial, Integral o Futuro Activo) y sus coberturas?',
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.text }),
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.answer, sources: data.sources || [] }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Lo siento, no pude conectarme con el servidor de consultas. Verifica que la instancia EC2 esté encendida y el puerto 8000 abierto.',
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto', fontFamily: 'system-ui, sans-serif', padding: '0 1rem' }}>
      <header style={{ background: '#0f2942', color: 'white', padding: '1.2rem', borderRadius: '10px 10px 0 0' }}>
        <h2 style={{ margin: 0 }}>Seguros Horizonte Vida</h2>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
          Asistente Virtual de Pólizas y Coberturas (RAG Demo)
        </p>
      </header>

      <div style={{
        border: '1px solid #ddd',
        height: '450px',
        overflowY: 'auto',
        padding: '1rem',
        background: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? '#1d4ed8' : '#ffffff',
              color: msg.sender === 'user' ? '#ffffff' : '#1f2937',
              padding: '0.85rem 1.1rem',
              borderRadius: '12px',
              maxWidth: '80%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              whiteSpace: 'pre-line'
            }}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
            {msg.sources && msg.sources.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280', borderTop: '1px solid #eee', paddingTop: '0.3rem' }}>
                Fuente: {msg.sources.join(', ')}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: '#6b7280', fontStyle: 'italic' }}>
            Consultando pólizas...
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej. ¿Qué cubre la cláusula de enfermedades graves?"
          style={{ flex: 1, padding: '0.9rem', border: 'none', outline: 'none', fontSize: '1rem' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ background: '#0f2942', color: 'white', border: 'none', padding: '0 1.5rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

export default App;