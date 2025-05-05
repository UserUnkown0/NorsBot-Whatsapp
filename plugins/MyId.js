// plugins/mentionall.js
export default function (sock) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;
        const isGroup = remoteJid.endsWith('@g.us');

        // Comando para obtener tu ID
        if (msg.message.conversation && msg.message.conversation === '!myid') {
            if (isGroup) {
                // Responder con error si se usa en grupo
                await sock.sendMessage(remoteJid, {
                    text: '⚠️ Este comando solo puede usarse en el chat privado con el bot.'
                });
                return;
            }

            try {
                const botJid = sock.user.id;
                await sock.sendMessage(remoteJid, { text: `🤖 Mi ID es: ${botJid}` });
                console.log(`✅ ID del bot: ${botJid}`);
            } catch (error) {
                console.error('❌ Error al obtener el ID:', error);
            }
        }
    });
}
