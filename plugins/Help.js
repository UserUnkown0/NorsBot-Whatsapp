// plugins/help.js
export default function (sock) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return; // Solo ejecutamos el comando si no es del bot

        // Comando para mostrar ayuda
        if (msg.message.conversation && msg.message.conversation === '!help') {
            const helpMessage = `
*🆘 Comandos disponibles:*

1. *!say [mensaje]*: El bot repetirá el mensaje que escribas después del comando. Ejemplo: *!say Hola, bot*.
2. *!leavebot*: El bot se saldrá del grupo en el que esté. Solo los administradores pueden usar este comando.
3. *!help*: Muestra esta lista de comandos.

*👀 Usa estos comandos para interactuar con el bot.*
            `;

            // Enviar el mensaje de ayuda
            await sock.sendMessage(msg.key.remoteJid, {
                text: helpMessage
            });
            console.log(`✅ Se envió el mensaje de ayuda a ${msg.key.remoteJid}`);
        }
    });
}
