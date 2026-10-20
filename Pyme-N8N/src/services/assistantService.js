export async function sendAssistantMessage(message) {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error(
      "El webhook de n8n aún no está configurado. Primero debemos crear y probar el workflow.",
    );
  }

  let response;

  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accion: "asistente",
        mensaje: message,
        session_id: "demo-facturabot",
      }),
    });
  } catch {
    throw new Error(
      "No se pudo contactar con n8n. Comprueba que esté ejecutándose y que el webhook sea correcto.",
    );
  }

  if (!response.ok) {
    throw new Error(`n8n respondió con el código ${response.status}.`);
  }

  return response.json();
}
