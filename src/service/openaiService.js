/* import openai from "@/config/openai";
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

export default async function chatWithAssistant(userMessage, threadId = null) {
  try {
    // 1. Crear thread si no existe
    let threadToUse = threadId;
    if (!threadToUse) {
      const threadResponse = await openai.beta.threads.create();
      threadToUse = threadResponse.id;
    }

    // 2. Agregar mensaje del usuario
    await openai.beta.threads.messages.create(threadToUse, {
      role: "user",
      content: userMessage,
    });

    // 3. Ejecutar el run
    const run = await openai.beta.threads.runs.create(threadToUse, {
      assistant_id: ASSISTANT_ID,
    });

    // 4. Esperar que termine con polling más agresivo
    let status = "in_progress";
    let pollCount = 0;
    while (status === "in_progress" || status === "queued") {
      // Asegurar que ambos valores sean strings válidos
      if (!threadToUse || !run.id) {
        throw new Error(`Parámetros inválidos: threadToUse=${threadToUse}, run.id=${run.id}`);
      }
      
      const runStatus = await openai.beta.threads.runs.retrieve(
        run.id,
        threadToUse
      );
      status = runStatus.status;
      
      // Polling más agresivo: comenzar con 250ms, luego 500ms, luego 1s
      let delay = 250;
      if (pollCount > 3) delay = 500;
      if (pollCount > 8) delay = 1000;
      
      await new Promise((r) => setTimeout(r, delay));
      pollCount++;
    }

    // 5. Obtener respuesta
    const messages = await openai.beta.threads.messages.list(threadToUse);

    const assistantMessage = messages.data.find((m) => m.role === "assistant");

    if (!assistantMessage) {
      console.error("⚠️ No se encontró respuesta del asistente.");
      return { error: true, message: "No se encontró respuesta del asistente" };
    }

    const reply = (assistantMessage?.content?.[0]?.text?.value || "Sin respuesta").replace(/【.*?†.*?】/g, "");

    return { reply, thread_id: threadToUse };

  } catch (err) {
    console.error("❌ Error en chatWithAssistant:", err);
    return { error: true, message: err.message };
  }
}
 */