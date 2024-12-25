const myDB = {
  tables: [],
};

let currentDB = myDB;

function showDataBase() {
  console.log("*".repeat(10));
  console.log("DATABASE:\n", currentDB);
  console.log("*".repeat(10));
}

const isMatchingTable = (tableName) => {
  return (element) => element.tableName === tableName;
};

const getTableLocation = (database, tableName) =>
  database.tables.findIndex(isMatchingTable(tableName));

function doesTableExist(database, tableName) {
  return getTableLocation(database, tableName) >= 0;
}

const toObject = (array) => {
  const obj = {};
  obj[array[0]] = array[1];
  return obj;
};

const createTable = (database, name, columns) => {
  if (doesTableExist(database, name)) {
    console.log("Could not create table, name already exists");
    return;
  }

  if (!columns) {
    console.log("Invalid argument length for columns");
    return;
  }

  const seperatedCols = columns.split(",").map((col) => col.split(":"));
  const colsAsObjects = seperatedCols.map(toObject);
  database.tables.push({ tableName: name, columns: colsAsObjects, rows: [] });
  console.log("Succesfully created table", name);
};

const dropTable = (database, tableName) => {
  const tableIndex = getTableLocation(database, tableName);
  database.tables.splice(tableIndex, tableIndex + 1);

  console.log(tableName, "table dropped");
};

const isNumber = (table, key) => {
  const column = table.columns.filter(
    (column) => Object.keys(column)[0] === key
  );
  return column[0][key] === "number";
};

const isMatchingDatatype = (table, key, value) => {
  const column = table.columns.filter(
    (column) => Object.keys(column)[0] === key
  );

  console.log(column[0][key], typeof value, key, value);
  return column[0][key] === typeof value && !isNaN(value);
};

const createRow = (table) => {
  return (obj, value, index) => {
    const key = Object.keys(table.columns[index])[0];
    obj[key] = isNumber(table, key) ? +value : value;

    return isMatchingDatatype(table, key, obj[key]) ? obj : {};
  };
};

const insertIntoTable = (database, tableName, values) => {
  const table = database.tables[getTableLocation(database, tableName)];
  const splitValues = values.split(",");

  if (splitValues.length !== table.columns.length) {
    console.log("Could not insert values, invalid argument length");
    return;
  }

  const pushedValues = splitValues.reduce(createRow(table), {});

  if (Object.keys(pushedValues).length !== splitValues.length) {
    console.log("Data type mismatch for arguments");
    return;
  }

  database.tables[getTableLocation(database, tableName)].rows.push(
    pushedValues
  );

  console.log("Values inserted succesfully");
};

const comparators = {
  ">": (num1, num2) => num1 > num2,
  ">=": (num1, num2) => num1 >= num2,
  "<": (num1, num2) => num1 < num2,
  "<=": (num1, num2) => num1 <= num2,
  "==": (num1, num2) => num1 == num2,
  "===": (num1, num2) => num1 === num2,
  "!=": (num1, num2) => num1 != num2,
  "!==": (num1, num2) => num1 !== num2,
};

function getPredicate(condition) {
  let predicate = () => true;
  if (condition) {
    const operands = condition.split(" ");
    const key = operands[0];
    const comparator = operands[1];
    const value = operands[2];

    predicate = (row) => {
      return comparators[comparator](row[key], value);
    };
  }

  return predicate;
}

const selectFromTable = (database, tableName, condition) => {
  const predicate = getPredicate(condition);
  const table = database.tables[getTableLocation(database, tableName)];
  const selectedRows = table.rows.filter(predicate);

  console.log("Rows fetched:", selectedRows.length);
  console.table(selectedRows);
};

const updateTable = (database, tableName, key, value, condition) => {
  const predicate = getPredicate(condition);
  const table = database.tables[getTableLocation(database, tableName)];
  let updateCount = 0;

  for (const row of table.rows) {
    if (predicate(row)) {
      row[key] = isNumber(table, key) ? +value : value;
      updateCount += 1;
    }
  }

  console.log(updateCount + "rows updated");
};

const deleteRow = (database, tableName, condition) => {
  const predicate = getPredicate(condition);
  const table = database.tables[getTableLocation(database, tableName)];
  let index = 0;
  let deleteCount = 0;

  while (index < table.rows.length) {
    if (predicate(table.rows[index])) {
      table.rows.splice(index, index + 1);
      index -= 1;
      deleteCount += 1;
    }

    index++;
  }

  console.log(deleteCount + "rowa deleted");
};

showDataBase(myDB);

const commands = {
  CREATE: createTable,
  DROP: dropTable,
  INSERT: insertIntoTable,
  SELECT: selectFromTable,
  UPDATE: updateTable,
  DELETE: deleteRow,
  SHOWDB: showDataBase,
};

const breakQuery = (database, query) => {
  const whereSplit = query.split("WHERE ");
  const args = whereSplit[0].trimEnd().split(" ");
  const command = args[0];
  const condition = whereSplit[1];

  return [database, args, command, condition];
};

function validateQuery(database, args, command) {
  if (command === "" || command === "EXIT") {
    return false;
  }

  if (!(command in commands)) {
    console.log("Invalid Command");
    return false;
  }

  if (
    command !== "CREATE" &&
    command !== "SHOWDB" &&
    !doesTableExist(database, args[1])
  ) {
    console.log(args[1] + " table does not exist");
    return false;
  }

  return true;
}

const executeQuery = (database, args, command, condition) => {
  commands[command](database, ...args.slice(1, args.length), condition);
};

let query = "";
while (query !== "EXIT") {
  query = prompt("MYPQL>");

  const splitQuery = breakQuery(currentDB, query);

  if (validateQuery(...splitQuery)) {
    executeQuery(...splitQuery);
  }
}
