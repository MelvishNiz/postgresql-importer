import 'dotenv/config';
import fs from "fs";
import select from '@inquirer/select';
import confirm from '@inquirer/confirm';
import { logger } from "./utils/utils.js";
import { client, connect, getTables, insertData } from "./utils/postgresql.js";
import { readExcelFile } from "./utils/excel.js";

// Connect to Database
await connect();
const tables = await getTables();
if(tables.length == 0){
  logger('info', "No Tables Found")
  process.exit();
}

// Select Table
const tableName = await select({
  message: 'Select Table',
  choices: tables.reduce((res, curr) => {
      res.push({ name: curr, value: curr});
      return res;
    },[]),
});

// Select Excel File
const files = fs.readdirSync("./files");
const fileName = await select({
  message: 'Select  Excel File',
  choices: files.reduce((res, curr) => {
    if(curr.includes('xlsx')) res.push({ name: curr, value: curr});
    return res;
  },[]),
});
const { headers, rows } = await readExcelFile(fileName);
if(headers.length == 0 || rows.length == 0){
  logger('info', "Columns    : ".padEnd(10) + headers);
  logger('info', "Rows Count : ".padEnd(10) + rows.length);
  logger('info', "Please Fill at least 1 columns and rows")
  process.exit();
}

// Confirm
console.log("==========================================================");
logger('info', "DB_HOST    : ".padEnd(10) + process.env.DB_HOST);
logger('info', "DB_USER    : ".padEnd(10) + process.env.DB_USER);
logger('info', "DB_NAME    : ".padEnd(10) + process.env.DB_NAME);
logger('info', "Table Name : ".padEnd(10) + tableName);
logger('info', "Columns    : ".padEnd(10) + headers);
logger('info', "Rows Count : ".padEnd(10) + rows.length);
console.log("==========================================================");

if(!await confirm({ message: 'Continue Import?' , default: false})){
  logger('info', 'Exit');
  process.exit();
}


// Begin Transactions
client.query("BEGIN");
let successData = [];
let index = 0;
while(index < rows.length){
  const query = await insertData(tableName, headers, rows[index], (index + 1));
  if(query.status == "success") successData.push(query.data);
  else{
    // Rollback
    client.query("ROLLBACK");
    logger('error', "Rollback Applied");
    process.exit();
  }

  if((index+1) == rows.length){
    console.log("==========================================================");
    logger('info', "Success Insert : ".padEnd(10) + successData.length);
    console.log("==========================================================");
   
    // Commit
    client.query("COMMIT");
    logger('success', "Commit Applied");
    process.exit();
  }
  index++;
}





