import mysql from "mysql2/promise";

const DBconfiguracion = {
  host: process.env.DB_HOST || "64.225.53.185",
  user: process.env.DB_USER || "asistencia_user",
  password: process.env.DB_PASSWORD || "biometricoADS2proyecto",
  database: process.env.DB_NAME || "asistencia",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3375,
};

// funcion que devuelve la conexion para usar en los endpoints
export async function connect() {
  const connection = await mysql.createConnection(DBconfiguracion);
  return connection;
}
