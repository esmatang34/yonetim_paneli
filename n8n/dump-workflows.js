const { DatabaseSync } = require("node:sqlite");
const d = new DatabaseSync("/home/node/.n8n/database.sqlite", { readOnly: true });
const ids = ["Hn2Pgnz5GW2LZnL7", "YWYlF8yZmsSXJaGT", "qCCte0dnvtqMBQGE", "Lz3mnrvlELf4rbKm"];
for (const id of ids) {
  const wf = d.prepare("SELECT id, name, active, nodes, connections FROM workflow_entity WHERE id=?").get(id);
  const nodes = JSON.parse(wf.nodes);
  const slim = nodes.map((n) => ({
    name: n.name,
    type: n.type,
    typeVersion: n.typeVersion,
    webhookId: n.webhookId,
    parameters: n.parameters,
  }));
  console.log("\n==========", wf.name, "active=" + wf.active, "==========");
  console.log(JSON.stringify({ connections: JSON.parse(wf.connections), nodes: slim }, null, 2));
}
const hooks = d.prepare("SELECT * FROM webhook_entity").all();
console.log("\n========== WEBHOOKS ==========");
console.log(JSON.stringify(hooks, null, 2));
