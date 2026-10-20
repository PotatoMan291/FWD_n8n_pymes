import { useState } from "react";
import {
  Bot,
  Send,
  UserRound,
  Sparkles,
  FileText,
  Users,
  CircleAlert,
} from "lucide-react";
import Swal from "sweetalert2";
import { sendAssistantMessage } from "../services/assistantService";

const suggestions = [
  { icon: FileText, text: "¿Cuántas facturas pendientes tengo?" },
  { icon: Users, text: "¿Qué proveedores están registrados?" },
  { icon: Sparkles, text: "Ayúdame a registrar una factura" },
];

export default function Asistente() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  async function sendMessage(text = message) {
    const clean = text.trim();
    if (!clean || sending) return;

    setMessages((current) => [...current, { role: "user", text: clean }]);
    setMessage("");
    setSending(true);

    try {
      const result = await sendAssistantMessage(clean);
      const responseText =
        result?.data?.respuesta ||
        result?.data?.message ||
        result?.respuesta ||
        result?.message ||
        JSON.stringify(result, null, 2);

      setMessages((current) => [
        ...current,
        { role: "assistant", text: responseText },
      ]);
    } catch (error) {
      const response = error.message || "No se pudo conectar con el asistente.";

      setMessages((current) => [...current, { role: "error", text: response }]);

      await Swal.fire({
        icon: "info",
        title: "Asistente todavía no conectado",
        text: response,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-content assistant-page">
      <section className="assistant-hero">
        <div className="assistant-hero-icon">
          <Bot size={29} />
        </div>
        <span className="eyebrow">ASISTENTE DE FACTURACIÓN</span>
        <h2>Tu gestión, en una conversación.</h2>
        <p>
          El objetivo es permitirte consultar y gestionar facturas mediante
          instrucciones en lenguaje natural.
        </p>
        <div className="assistant-status">
          <span className="status-dot status-dot-muted" /> Integración con n8n y
          Groq pendiente
        </div>
      </section>

      <section className="chat-panel">
        <div className="chat-header">
          <div className="chat-avatar">
            <Bot size={21} />
          </div>
          <div>
            <strong>FacturaBot Assistant</strong>
            <span>Demostración académica</span>
          </div>
          <span className="local-badge">LOCAL</span>
        </div>

        <div className="chat-messages">
          <div className="chat-message assistant-message">
            <div className="message-avatar">
              <Bot size={17} />
            </div>
            <div className="message-content">
              <p>¡Hola! Soy el asistente de FacturaBot.</p>
              <p>
                Esta interfaz está lista para conectarse con el agente de IA.
                Primero construiremos y probaremos el workflow en n8n.
              </p>
              <span className="message-time">Mensaje inicial</span>
            </div>
          </div>

          {messages.map((item, index) => (
            <div
              className={`chat-message ${item.role === "user" ? "user-message" : "assistant-message"}`}
              key={index}
            >
              <div className="message-avatar">
                {item.role === "user" ? (
                  <UserRound size={17} />
                ) : item.role === "error" ? (
                  <CircleAlert size={17} />
                ) : (
                  <Bot size={17} />
                )}
              </div>
              <div className="message-content">
                <p>{item.text}</p>
                <span className="message-time">
                  {item.role === "user"
                    ? "Tú"
                    : item.role === "error"
                      ? "Conexión"
                      : "FacturaBot"}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="loading-state">
              El asistente está procesando tu solicitud…
            </div>
          )}
        </div>

        {!messages.length && (
          <div className="suggestions">
            <span className="eyebrow">
              PRUEBA ESTAS IDEAS CUANDO CONECTEMOS LA IA
            </span>
            {suggestions.map(({ icon: Icon, text }) => (
              <button
                key={text}
                className="suggestion-chip"
                onClick={() => setMessage(text)}
              >
                <Icon size={16} /> {text}
              </button>
            ))}
          </div>
        )}

        <form
          className="chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escribe una instrucción..."
            aria-label="Mensaje para el asistente"
            disabled={sending}
          />
          <button
            type="submit"
            className="button button-primary send-button"
            disabled={sending || !message.trim()}
            aria-label="Enviar mensaje"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="chat-disclaimer">
          No introduzcas datos fiscales reales ni información confidencial en
          esta demostración.
        </p>
      </section>
    </div>
  );
}
