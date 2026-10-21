const item = $input.first().json;
const nested = item.body && typeof item.body === "object" && !Array.isArray(item.body) ? item.body : {};
const body = Object.assign({}, item.query || {}, nested);
if (!body.action && item.action) body.action = item.action;
if (!body.table && item.table) body.table = item.table;
if (!body.id && item.id) body.id = item.id;

const action = String(body.action || "").toLowerCase();
const alias = { assignments: "staff_assignments" };
const table = alias[body.table] || body.table || "users";

const schemas = {
  users: { cols: ["name", "birthdate", "gender", "job"] },
  devices: { cols: ["device_name", "brand", "model", "serial_number", "device_type", "price"] },
  staff: { cols: ["name", "department", "job", "phone", "email"] },
  purchases: { cols: ["user_id", "device_id", "purchase_date", "price", "status"] },
  staff_assignments: { cols: ["staff_id", "user_id", "device_id", "assigned_date", "status"] },
};

if (!schemas[table]) {
  throw new Error("Geçersiz tablo: " + table);
}
if (!["create", "update", "delete"].includes(action)) {
  throw new Error("Geçersiz işlem: " + action);
}

function emptyToNull(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

if (action === "delete") {
  const id = emptyToNull(body.id);
  if (!id) throw new Error("Silmek için id gerekli");
  return [{ json: { query: `DELETE FROM ${table} WHERE id = $1::int RETURNING *`, values: [id] } }];
}

const cols = schemas[table].cols;
const values = cols.map((col) => emptyToNull(body[col]));

if (action === "create") {
  const placeholders = cols.map((_, i) => `$${i + 1}`);
  return [{
    json: {
      query: `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
      values,
    },
  }];
}

const id = emptyToNull(body.id);
if (!id) throw new Error("Güncellemek için id gerekli");
const sets = cols.map((col, i) => `${col} = COALESCE($${i + 1}, ${col})`);
return [{
  json: {
    query: `UPDATE ${table} SET ${sets.join(", ")} WHERE id = $${cols.length + 1}::int RETURNING *`,
    values: values.concat([id]),
  },
}];
