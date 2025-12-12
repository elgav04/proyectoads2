import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

//ruta certificado DB digital ocean
const caPath = path.join(process.cwd(), "certs", "ca-certificate.crt");

const DBconfiguracion = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 25060,
  ssl: {
    ca: fs.readFileSync(caPath)
  }
};

// funcion que devuelve la conexion para usar en los endpoints
export async function connect() {
  const connection = await mysql.createConnection(DBconfiguracion);
  return connection;
}
