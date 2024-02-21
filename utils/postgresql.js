import pkg from 'pg';
const { Client } = pkg;
import { logger } from './utils.js';
let counter = 0;

export const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export const connect = async () => {
  try {
    await client.connect();
    logger('success', 'Connected to the database');
  } catch (err) {
    logger('error', `Error connecting to the database (${counter})`);
    logger('info', "Retrying connection to database")
    counter++;
    await new Promise(r => setTimeout(r, 1000));
    await connect();
  }
}

export const getTables = async () => {
  try {
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );

    const tables = result.rows.reduce((res, cur) => {
      res.push(cur.table_name);
      return res;
    },[]);
    
    return tables;
  } catch (error) {
    logger('error', 'Error fetching table list:', error);
  };
}

export const insertData = async (tableName, headers, row, currentRowNumber) => {
  const columns = headers.join(", ");
  let values = "";
  const data = {};

  // Compile Data
  headers.forEach(header => {
    data[header] = row[header] || null;
  });
  for(let i = 0; i < headers.length; i++){
    values += `$${i+1}`
    if(i != headers.length - 1) values += ", ";
  }

  try {
    const query = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${values});
    `;

    // Eksekusi query dengan parameter
    const result = await client.query(query, Object.values(data));
    logger('success', `ROW (${currentRowNumber}) Data inserted successfully: ${result.rowCount}`)
    return {
      status: "success",
      data: data
    };
  } catch (err) {
    if(err.code == 23505) logger('info', `ROW (${currentRowNumber}) Error inserting data: ${err}`)
    else logger('error', `ROW (${currentRowNumber}) Error inserting data: ${err}`)

    return {
      status: "error",
      data: data
    };
  }
}