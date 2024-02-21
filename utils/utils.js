import chalk from "chalk";
export const logger = (type, message) => {
  const date = new Date().toLocaleTimeString();
  switch(type){
    case "success":
      console.log(`${date} | ${chalk.green(type.toString().toUpperCase().padEnd(7))} | ${message}`);
      break;
    case "error":
      console.log(`${date} | ${chalk.red(type.toString().toUpperCase().padEnd(7))} | ${message}`);
      break;
    case "info":
      console.log(`${date} | ${chalk.blue(type.toString().toUpperCase().padEnd(7))} | ${message}`);
      break;
    default:
      console.log(`${date} | ${chalk.gray(type.toString().toUpperCase().padEnd(7))} | ${message}`);
      break;
  }
}