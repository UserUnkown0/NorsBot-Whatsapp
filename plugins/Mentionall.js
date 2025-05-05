export default function (sock) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return; // Solo ejecutamos si no es del bot

        const mensajeTexto = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const comando = '!mentionall';

        if (mensajeTexto && mensajeTexto.trim() === comando) {
            const remoteJid = msg.key.remoteJid;
            const isGroup = remoteJid.endsWith('@g.us'); // Verificar si es un grupo
            const senderId = msg.key.participant || msg.key.remoteJid;
            const ownerId = '593997767513:26@s.whatsapp.net';

            // No permitir ejecutar el comando en privado
            if (!isGroup) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ Este comando solo se puede usar en grupos.'
                });
            }

            try {
                const groupMetadata = await sock.groupMetadata(remoteJid);
                const participants = groupMetadata.participants;
                const botJid = sock.user.id;

                const adminIds = participants
                    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                    .map(p => p.id);

                // Verificar si el remitente es admin o el dueño
                if (!adminIds.includes(senderId) && senderId !== ownerId) {
                    return sock.sendMessage(remoteJid, {
                        text: '❌ Solo los administradores o el dueño pueden usar este comando.'
                    });
                }

                let mentionMessage = '¡Hola a todos! 👋\n\n';
                const mentions = [];

                participants.forEach(participant => {
                    if (participant.id !== botJid) {
                        mentionMessage += `@${participant.id.split('@')[0]}\n`;
                        mentions.push(participant.id);
                    }
                });

                await sock.sendMessage(remoteJid, {
                    text: mentionMessage,
                    mentions: mentions
                });

                console.log(`✅ Se mencionaron a todos los miembros del grupo ${remoteJid}`);
            } catch (error) {
                console.error('❌ Error al mencionar a los miembros:', error);
                sock.sendMessage(remoteJid, {
                    text: '⚠️ Ocurrió un error al intentar mencionar a todos.'
                });
            }
        }
    });
}
