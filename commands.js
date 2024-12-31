export const EMPTYOBJECT = {};

const toObject = (array) => {
  const obj = {};
  obj[array[0]] = array[1];
  return obj;
};

const createTable = (_, name, columns, __, isExistingTable) => {
  if (isExistingTable) {
    console.log("Could not create table, name already exists");
    return EMPTYOBJECT;
  }
  if (columns.length === 0) {
    console.log("Invalid argument length for columns");
    return EMPTYOBJECT;
  }

  const seperatedCols = columns[0].split(",").map((col) => {
    return col.split(":");
  });
  const colsAsObjects = seperatedCols.map(toObject);
  console.log("Succesfully created table " + name);

  return { tableName: name, columns: colsAsObjects, rows: [] };
};

const isNumber = (table, key) => {
  const column = table.columns.filter(
    (column) => Object.keys(column)[0] === key
  );
  return column[0][key] === "number";
};

const isNaN = (number) => {
  return "" + number === "NaN" && number !== "NaN";
};

const isMatchingDatatype = (table, key, value) => {
  const column = table.columns.filter(
    (column) => Object.keys(column)[0] === key
  );

  return column[0][key] === typeof value && !isNaN(value);
};

const createRow = (table) => {
  return (obj, value, index) => {
    const key = Object.keys(table.columns[index])[0];
    obj[key] = isNumber(table, key) ? +value : value;

    return isMatchingDatatype(table, key, obj[key]) ? obj : {};
  };
};

const insertIntoTable = (originalTable, name, values) => {
  const splitValues = values[0].split(",");

  if (splitValues.length !== originalTable.columns.length) {
    console.log("Could not insert values, invalid argument length");
    return EMPTYOBJECT;
  }

  const pushedValues = splitValues.reduce(createRow(originalTable), {});

  if (Object.keys(pushedValues).length !== splitValues.length) {
    console.log("Data type mismatch for arguments");
    return EMPTYOBJECT;
  }

  const resultTable = { ...originalTable };
  resultTable.rows.push(pushedValues);
  console.log("Succesfully inserted " + values + " into " + name + " table");

  return resultTable;
};

const comparators = {
  ">": (num1, num2) => num1 > num2,
  ">=": (num1, num2) => num1 >= num2,
  "<": (num1, num2) => num1 < num2,
  "<=": (num1, num2) => num1 <= num2,
  "==": (num1, num2) => num1 == num2,
  "===": (num1, num2) => num1 == num2,
  "!=": (num1, num2) => num1 != num2,
  "!==": (num1, num2) => num1 != num2,
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

const selectFromTable = (originalTable, tableName, _, condition) => {
  const predicate = getPredicate(condition);
  const selectedRows = originalTable.rows.filter(predicate);

  console.log(
    "Row(s) fetched: " + selectedRows.length + " from " + tableName + " table"
  );
  console.table(selectedRows);

  return EMPTYOBJECT;
};

const updateTable = (originalTable, tableName, args, condition) => {
  const key = args[0];
  const value = args[1];
  const predicate = getPredicate(condition);
  const resultTable = { ...originalTable };
  let updateCount = 0;

  for (const row of resultTable.rows) {
    if (predicate(row)) {
      row[key] = isNumber(resultTable, key) ? +value : value;
      updateCount += 1;
    }
  }

  console.log(updateCount + " row(s) updated in " + tableName + " table");
  return resultTable;
};

const deleteRow = (originalTable, tableName, _, condition) => {
  const predicate = getPredicate(condition);
  const resultTable = { ...originalTable };
  let index = 0;
  let deleteCount = 0;

  while (index < resultTable.rows.length) {
    if (predicate(resultTable.rows[index])) {
      resultTable.rows.splice(index, 1);
      index -= 1;
      deleteCount += 1;
    }

    index++;
  }

  console.log(deleteCount + " row(s) deleted from " + tableName + " table");
  return resultTable;
};

const truncateTable = (originalTable, tableName) => {
  console.log("Truncated " + tableName + " table succesfully");
  return deleteRow(originalTable, tableName, "", "");
};

export const commands = {
  CREATE: createTable,
  INSERT: insertIntoTable,
  SELECT: selectFromTable,
  UPDATE: updateTable,
  DELETE: deleteRow,
  TRUNCATE: truncateTable,
};
