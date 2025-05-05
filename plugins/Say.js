// plugins/say.js
export default function (sock) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return; // Solo ejecutamos el comando si no es del bot

        // Comando para repetir el mensaje
        if (msg.message.conversation && msg.message.conversation.startsWith('!say ')) {
            const messageToRepeat = msg.message.conversation.slice(5).trim(); // Extrae el mensaje después de "!say "

            if (messageToRepeat) {
                // Enviar el mensaje repetido
                await sock.sendMessage(msg.key.remoteJid, {
                    text: messageToRepeat
                });
                console.log(`✅ El bot ha repetido: ${messageToRepeat}`);
            } else {
                // Si no hay mensaje después de !say
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Por favor, escribe algo después de !say para que lo repita.'
                });
            }
        }
    });
}
