import { Client } from 'whatsapp-web.js';
import fs from 'fs';

const SESSION_FILE_PATH = './whatsapp-session.json';

let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}

const client = new Client({
  puppeteer: { headless: true },
  session: sessionData,
});

// Evento para guardar sesión
client.on('authenticated', (session) => {
  console.log('Sesión autenticada.');
  fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
});

// Evento para manejar mensajes entrantes
client.on('message', (message) => {
  console.log(`Mensaje recibido de ${message.from}: ${message.body}`);
  // Aquí puedes guardar el mensaje en la base de datos
});

// Inicializar cliente
client.initialize();

export default client;
