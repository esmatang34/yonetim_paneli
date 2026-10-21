const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const dir = __dirname;
const htmlCode = fs.readFileSync(dir + "/n8n-code-html.js", "utf8");
const sqlCode = fs.readFileSync(dir + "/n8n-code-sql.js", "utf8");

const db = new DatabaseSync("/home/node/.n8n/database.sqlite");

function patchWorkflow(id, mutator) {
  const row = db.prepare("SELECT nodes, connections, versionCounter FROM workflow_entity WHERE id = ?").get(id);
  const nodes = JSON.parse(row.nodes);
  const connections = JSON.parse(row.connections);
  mutator(nodes, connections);
  db.prepare(
    "UPDATE workflow_entity SET nodes = ?, connections = ?, versionCounter = ?, updatedAt = datetime('now') WHERE id = ?"
  ).run(JSON.stringify(nodes), JSON.stringify(connections), (row.versionCounter || 0) + 1, id);
}

patchWorkflow("YWYlF8yZmsSXJaGT", (nodes, connections) => {
  const htmlNode = nodes.find((n) => n.name === "Code in JavaScript");
  htmlNode.parameters.jsCode = htmlCode;

  const insertNode = nodes.find((n) => n.name === "INSERT");
  insertNode.parameters.query = "={{ $json.query }}";
  insertNode.parameters.options = insertNode.parameters.options || {};
  insertNode.parameters.options.queryReplacement = "={{ $json.values }}";

  let sqlNode = nodes.find((n) => n.name === "Build SQL");
  if (!sqlNode) {
    sqlNode = {
      id: "build-sql-normalize-001",
      name: "Build SQL",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [-320, 144],
      parameters: { jsCode: sqlCode },
    };
    nodes.push(sqlNode);
  } else {
    sqlNode.parameters.jsCode = sqlCode;
  }

  connections.Webhook2 = { main: [[{ node: "Build SQL", type: "main", index: 0 }]] };
  connections["Build SQL"] = { main: [[{ node: "INSERT", type: "main", index: 0 }]] };
  delete connections.Switch;
});

patchWorkflow("Hn2Pgnz5GW2LZnL7", (nodes) => {
  const getUsers = nodes.find((n) => n.name === "PostgreSQL - Get Users");
  if (getUsers) {
    getUsers.parameters.query = "SELECT * FROM users ORDER BY id;";
    getUsers.parameters.toolDescription =
      "PostgreSQL users tablosundaki tüm kullanıcıları listelemek, okumak, saymak ve istatistik yapmak için kullan.";
  }
});

console.log("patched");
