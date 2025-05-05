export default function (sock) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const messageType = Object.keys(msg.message)[0];
        const botMentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(sock.user.id);

        // Obtener el texto del mensaje
        let text = '';
        if (messageType === 'conversation') {
            text = msg.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            text = msg.message.extendedTextMessage.text;
        }

        // Responder al comando "!hola" o si mencionan al bot
        if (text === '!hola' || botMentioned) {
            await sock.sendMessage(from, {
                text: `👋 ¡Hola ${msg.pushName || 'usuario'} ¿En qué puedo ayudarte?`
            }, { quoted: msg });
        }
    });
}
