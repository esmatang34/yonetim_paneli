const { DatabaseSync } = require("node:sqlite");
const d = new DatabaseSync("/home/node/.n8n/database.sqlite", { readOnly: true });
const tables = d.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("TABLES", JSON.stringify(tables.map((t) => t.name)));
const cols = d.prepare("PRAGMA table_info(workflow_entity)").all();
console.log("WF_COLS", JSON.stringify(cols.map((c) => c.name)));
const rows = d.prepare("SELECT id, name, active FROM workflow_entity").all();
console.log("WORKFLOWS", JSON.stringify(rows, null, 2));
