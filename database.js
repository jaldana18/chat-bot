// database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('midatabase.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY, nombre TEXT, cedula TEXT, info TEXT)');
});

function insertarUsuario(nombre, cedula, info) {
  const stmt = db.prepare('INSERT INTO usuarios (nombre, cedula, info) VALUES (?, ?, ?)');
  stmt.run(nombre, cedula, info);
  stmt.finalize();
}

function obtenerInformacionUsuarioPorCedula(cedula, callback) {
  db.get('SELECT nombre, info FROM usuarios WHERE cedula = ?', [cedula], (err, row) => {
    callback(err, row);
  });
}

process.on('exit', () => db.close());

module.exports = {
  insertarUsuario,
  obtenerInformacionUsuarioPorCedula,
};
