import { commands } from "./commands.js";
import { EMPTYOBJECT } from "./commands.js";

const showDataBase = (database) => {
  console.log("\nDATABASE:");
  console.log("*".repeat(10));
  console.table(database.tables);
  console.log("*".repeat(10));

  return database;
};

const dropTable = (database, tableName, tableLocation) => {
  console.log(tableName, "table dropped");

  const tables = database.tables.toSpliced(tableLocation, tableLocation + 1);

  return { database, tables };
};

const internalCommands = {
  SHOWDB: showDataBase,
  DROP: dropTable,
};

const differringArgumentCommands = [
  "CREATE",
  "SHOWDB",
  "DROP",
  "SELECT",
  "DELETE",
  "TRUNCATE",
];

const validateCommands = (database, command, tableName) => {
  if (command === "" || command === "EXIT") {
    return false;
  }

  if (!(command in commands) && !(command in internalCommands)) {
    console.log("Invalid Command");
    return false;
  }

  const doesTableExist =
    database.tables.findIndex(isMatchingTable(tableName)) !== -1;

  if (command !== "CREATE" && command !== "SHOWDB" && !doesTableExist) {
    console.log(tableName + " table does not exist");
    return false;
  }

  return true;
};

const validateArguments = (command, commandArgs, condition) => {
  if (
    !differringArgumentCommands.includes(command) &&
    commandArgs.length === 0
  ) {
    console.log("Invalid Argument Length");
    return false;
  }

  if (condition && condition.split(" ").length !== 3) {
    console.log("Invalid condtion");
    return false;
  }

  return true;
};

const validateQuery = (
  database,
  tableName,
  commandArgs,
  command,
  condition
) => {
  return (
    validateCommands(database, command, tableName) &&
    validateArguments(command, commandArgs, condition)
  );
};

const isMatchingTable = (tableName) => {
  return (element) => element.tableName === tableName;
};

const executeQuery = (database, tableName, commandArgs, command, condition) => {
  const newDB = { ...database };
  const tableLocation = newDB.tables.findIndex(isMatchingTable(tableName));

  if (command in internalCommands) {
    return internalCommands[command](newDB, tableName, tableLocation);
  }

  const originalTable = newDB.tables[tableLocation];
  const isExistingTable = tableLocation !== -1;
  const newTable = commands[command](
    originalTable,
    tableName,
    commandArgs,
    condition,
    isExistingTable
  );

  if (!isExistingTable && newTable !== EMPTYOBJECT) {
    newDB.tables.push(newTable);
    return newDB;
  }
  if (newTable !== EMPTYOBJECT) {
    newDB.tables[tableLocation] = newTable;
    return newDB;
  }

  return database;
};

const splitQuery = (query) => {
  const whereSplit = query.split("WHERE ");
  const commandArgs = whereSplit[0].trimEnd().split(" ");
  const [command, tableName] = commandArgs;
  // const tableName = commandArgs[1];
  const condition = whereSplit[1];

  return [
    tableName,
    commandArgs.slice(2, commandArgs.length),
    command,
    condition,
  ];
};

const runMYPQL = (database, query) => {
  if (query === "EXIT") {
    return 0;
  }

  const queryInParts = splitQuery(query);

  if (validateQuery(database, ...queryInParts)) {
    const updatedDB = executeQuery(database, ...queryInParts);

    return runMYPQL(updatedDB, prompt("MYPQL>"));
  }

  return runMYPQL(database, prompt("MYPQL>"));
};

const main = () => {
  const myDB = {
    tables: [],
  };

  runMYPQL(myDB, "");
};

main();
