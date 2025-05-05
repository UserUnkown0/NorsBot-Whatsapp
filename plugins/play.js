import fs from 'fs';
import util from 'util';
import yts from 'yt-search';
import fetch from 'node-fetch';
import ytdlp from 'yt-dlp-exec';
import path from 'path';

const unlinkPromise = util.promisify(fs.unlink);
const statPromise = util.promisify(fs.stat);

// Función para formatear tamaño del archivo
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

// Asegurar que exista la carpeta playaudios/
const audioFolder = path.resolve('./playaudios');
if (!fs.existsSync(audioFolder)) {
  fs.mkdirSync(audioFolder, { recursive: true });
}

export default function registerPlayPlugin(sock) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      const from = msg.key.remoteJid;
      if (!msg.message || !msg.message.conversation || msg.key.fromMe) return;

      const body = msg.message.conversation;
      if (!body.toLowerCase().startsWith('!play ')) return;

      const query = body.slice(6).trim();
      if (!query) {
        await sock.sendMessage(from, { text: '❗ Escribe el nombre de una canción después de `!play`' });
        return;
      }

      const search = await yts(query);
      const video = search.videos[0];
      if (!video) {
        await sock.sendMessage(from, { text: '❌ No se encontró el video.' });
        return;
      }

      const { title, timestamp, url, author, image } = video;
      const audioFile = path.join(audioFolder, `audio_${Date.now()}.mp3`);

      await sock.sendMessage(from, {
        image: { url: image },
        caption:
`「✦」Descargando *${title}*

> ✐ Canal » ${author.name}
> ⴵ Duracion » ${timestamp}
> ✰ Calidad: 130k
> 🜸 Link » ${url}`
      });

      // Descargar audio en la carpeta playaudios/
      await ytdlp(url, {
        extractAudio: true,
        audioFormat: 'mp3',
        output: audioFile,
        quiet: true,
      });

      const stats = await statPromise(audioFile);
      const size = formatBytes(stats.size);

      await sock.sendMessage(from, {
        audio: { url: audioFile },
        mimetype: 'audio/mpeg',
        ptt: false,
        caption:
`> ✐ Canal » ${author.name}
> ⴵ Duracion » ${timestamp}
> ✰ Calidad: 130k
> ❒ Tamaño » ${size}
> 🜸 Link » ${url}`
      });

      // Eliminar archivo tras 5 segundos
      setTimeout(async () => {
        if (fs.existsSync(audioFile)) {
          try {
            await unlinkPromise(audioFile);
            console.log(`✅ Eliminado: ${audioFile}`);
          } catch (err) {
            console.error(`❌ No se pudo eliminar: ${audioFile}`, err);
          }
        }
      }, 5000);

    } catch (err) {
      console.error('❌ Error en !play:', err);
      await sock.sendMessage(messages[0].key.remoteJid, {
        text: '⚠️ Ocurrió un error al procesar tu solicitud. Intenta nuevamente.'
      });
    }
  });
}
