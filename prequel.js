import { commands } from "./commands.js";
import { EMPTYOBJECT } from "./commands.js";

const myDB = {
  tables: [],
};

// const anotherDB = {  //future implementation
//   tables: [],
// };

const currentDB = myDB;

const showDataBase = (database) => {
  console.log("DATABASE:");
  console.log("*".repeat(10));
  console.table(database.tables);
  console.log("*".repeat(10));
};

const dropTable = (database, tableName, tableLocation) => {
  database.tables.splice(tableLocation, tableLocation + 1);
  console.log(tableName, "table dropped");
};

const internalCommands = {
  SHOWDB: showDataBase,
  DROP: dropTable,
};

function validateQuery(database, tableName, _, command) {
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
}

const isMatchingTable = (tableName) => {
  return (element) => element.tableName === tableName;
};

const executeQuery = (database, tableName, args, command, condition) => {
  const tableLocation = database.tables.findIndex(isMatchingTable(tableName));

  if (command in internalCommands) {
    internalCommands[command](database, tableName, tableLocation);
    return;
  }

  const originalTable = database.tables[tableLocation];
  const isExistingTable = tableLocation !== -1;
  const newTable = commands[command](
    originalTable,
    tableName,
    args,
    condition,
    isExistingTable
  );

  if (!isExistingTable && newTable !== EMPTYOBJECT) {
    database.tables.push(newTable);
    return;
  }
  if (newTable !== EMPTYOBJECT) {
    database.tables[tableLocation] = newTable;
    return;
  }
};

const breakQuery = (query) => {
  const whereSplit = query.split("WHERE ");
  const args = whereSplit[0].trimEnd().split(" ");
  const command = args[0];
  const tableName = args[1];
  const condition = whereSplit[1];

  return [tableName, args.slice(2, args.length), command, condition];
};

let query = "";
while (query !== "EXIT") {
  query = prompt("MYPQL>");

  const splitQuery = breakQuery(query);

  if (validateQuery(currentDB, ...splitQuery)) {
    executeQuery(currentDB, ...splitQuery);
  }
}
