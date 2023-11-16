const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const moment = require("moment-timezone");
const colors = require("colors");
const fs = require("fs");
const db = require('./database');



const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  ffmpeg: "./ffmpeg.exe",
  authStrategy: new LocalAuth({ clientId: "client" }),
});
const config = require("./config/config.json");

client.on("qr", (qr) => {
  console.log(
    `[${moment().tz(config.timezone).format("HH:mm:ss")}] Scan the QR below : `
  );
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.clear();
  const consoleText = "./config/console.txt";
  fs.readFile(consoleText, "utf-8", (err, data) => {
    if (err) {
      console.log(
        `[${moment()
          .tz(config.timezone)
          .format("HH:mm:ss")}] Console Text not found!`.yellow
      );
      console.log(
        `[${moment().tz(config.timezone).format("HH:mm:ss")}] ${
          config.name
        } is Already!`.green
      );
    } else {
      console.log(data.green);
      console.log(
        `[${moment().tz(config.timezone).format("HH:mm:ss")}] ${
          config.name
        } is Already!`.green
      );
    }
  });
});

db.insertarUsuario("Juan Danilo Aldana Tibabisco", '1000573949', "Estudiante de desarrollo de software");

function responderSaludo(message, client) {
  const currentHour = moment().tz(config.timezone).format("HH");
  let greetingMessage;

  if (currentHour >= 5 && currentHour < 12) {
    greetingMessage = "Hola, buenos días.";
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingMessage = "Hola, buenas tardes.";
  } else {
    greetingMessage = "Hola, buenas noches.";
  }

  // Envía el saludo
  client.sendMessage(message.from, greetingMessage);
}

function obtenerInformacionUsuario(message, client) {
  client.sendMessage(message.from, "Por favor, proporciona tu cédula, ID o número de registro:");

  client.on("message", async (mensajeRespuesta) => {
    const cedulaUsuario = mensajeRespuesta.body;

    // Obtén la información del usuario por cédula desde la base de datos
    db.obtenerInformacionUsuarioPorCedula(cedulaUsuario, (err, usuario) => {
      if (err) {
        console.error("Error al obtener información del usuario:", err.message);
        client.sendMessage(message.from, "Error al obtener información del usuario. Por favor, inténtalo de nuevo más tarde.");
      } else if (usuario) {
        // Envía el nombre del usuario con la información adicional
        const respuestaMensaje = `Nombre: ${usuario.nombre}\nInformación adicional: ${usuario.info}`;
        client.sendMessage(message.from, respuestaMensaje);
      } else {
        client.sendMessage(message.from, "Usuario no encontrado en la base de datos.");
      }
    });
  });
}

client.on("message", async (message) => {
  const esGrupo = message.from.endsWith("@g.us") ? true : false;
  if ((esGrupo && config.grupos) || !esGrupo) {
    if (message.type === "chat") {
      const mensajeUsuario = message.body.toLowerCase();

      if (mensajeUsuario === '1') {
        responderSaludo(message, client);
      } else if (mensajeUsuario === '2') {
        obtenerInformacionUsuario(message, client);
      } else {
        client.sendMessage(message.from, "Opción no válida. Por favor, elige 1 o 2.");
      }
    } else {
      client.getChatById(message.id.remote).then(async (chat) => {
        await chat.sendSeen();
      });
    }
  }
});

client.initialize();
