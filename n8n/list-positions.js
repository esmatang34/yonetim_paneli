const { DatabaseSync } = require("node:sqlite");
const d = new DatabaseSync("/home/node/.n8n/database.sqlite", { readOnly: true });
const wf = d.prepare("SELECT nodes FROM workflow_entity WHERE id=?").get("YWYlF8yZmsSXJaGT");
const nodes = JSON.parse(wf.nodes);
for (const n of nodes) {
  console.log(n.name, JSON.stringify(n.position));
}
