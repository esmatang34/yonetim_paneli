const input = $input.first().json;
const data = input.data || {};

const users = data.users || [];
const devices = data.devices || [];
const staff = data.staff || [];
const purchases = data.purchases || [];
const assignments = data.staff_assignments || [];

function esc(value) {
  if (value === null || value === undefined) return "-";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function date(value) {
  if (!value) return "-";
  return String(value).split("T")[0];
}

function rowJson(obj) {
  return encodeURIComponent(JSON.stringify(obj));
}

function actionCell(table, record) {
  return `
    <td class="actions">
      <button class="updateBtn" data-table="${esc(table)}" data-record="${rowJson(record)}">✏️ Güncelle</button>
      <button class="deleteBtn" data-table="${esc(table)}" data-id="${esc(record.id)}">🗑️ Sil</button>
    </td>
  `;
}

function usersHtml() {
  if (!users.length) return `<tr><td colspan="6" class="empty">Kayıt bulunmuyor.</td></tr>`;
  return users.map((u) => `
    <tr>
      <td>${esc(u.id)}</td>
      <td>${esc(u.name)}</td>
      <td>${esc(date(u.birthdate))}</td>
      <td>${esc(u.gender)}</td>
      <td>${esc(u.job)}</td>
      ${actionCell("users", u)}
    </tr>
  `).join("");
}

function devicesHtml() {
  if (!devices.length) return `<tr><td colspan="8" class="empty">Kayıt bulunmuyor.</td></tr>`;
  return devices.map((d) => `
    <tr>
      <td>${esc(d.id)}</td>
      <td>${esc(d.device_name)}</td>
      <td>${esc(d.brand)}</td>
      <td>${esc(d.model)}</td>
      <td>${esc(d.serial_number)}</td>
      <td>${esc(d.device_type)}</td>
      <td>${esc(d.price)}</td>
      ${actionCell("devices", d)}
    </tr>
  `).join("");
}

function staffHtml() {
  if (!staff.length) return `<tr><td colspan="7" class="empty">Kayıt bulunmuyor.</td></tr>`;
  return staff.map((s) => `
    <tr>
      <td>${esc(s.id)}</td>
      <td>${esc(s.name)}</td>
      <td>${esc(s.department)}</td>
      <td>${esc(s.job)}</td>
      <td>${esc(s.phone)}</td>
      <td>${esc(s.email)}</td>
      ${actionCell("staff", s)}
    </tr>
  `).join("");
}

function purchasesHtml() {
  if (!purchases.length) return `<tr><td colspan="7" class="empty">Kayıt bulunmuyor.</td></tr>`;
  return purchases.map((p) => `
    <tr>
      <td>${esc(p.id)}</td>
      <td>${esc(p.user_id)}</td>
      <td>${esc(p.device_id)}</td>
      <td>${esc(date(p.purchase_date))}</td>
      <td>${esc(p.price)}</td>
      <td>${esc(p.status)}</td>
      ${actionCell("purchases", p)}
    </tr>
  `).join("");
}

function assignmentsHtml() {
  if (!assignments.length) return `<tr><td colspan="7" class="empty">Kayıt bulunmuyor.</td></tr>`;
  return assignments.map((a) => `
    <tr>
      <td>${esc(a.id)}</td>
      <td>${esc(a.staff_id)}</td>
      <td>${esc(a.user_id)}</td>
      <td>${esc(a.device_id)}</td>
      <td>${esc(date(a.assigned_date))}</td>
      <td>${esc(a.status)}</td>
      ${actionCell("staff_assignments", a)}
    </tr>
  `).join("");
}

const postUrl = "http://localhost:5678/webhook/musteriler";
const agentUrl = "http://localhost:5678/webhook/agent-chat";

const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Veritabanı Yönetimi</title>
<style>
* { box-sizing: border-box; }
body { font-family: Arial, sans-serif; margin: 0; padding: 30px 40px; background: #f5f6f8; color: #333; }
h1 { margin: 0 0 25px 0; }
#topButtons { position: fixed; top: 20px; right: 25px; display: flex; gap: 8px; z-index: 1000; }
.topBtn { border: none; border-radius: 6px; padding: 10px 16px; cursor: pointer; font-weight: bold; }
#addBtn { background: #27ae60; color: white; }
#chatBtn { background: #2c3e50; color: white; }
.tabs { display: flex; gap: 8px; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 25px; overflow-x: auto; }
.tab { border: none; background: #ecf0f1; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; white-space: nowrap; }
.tab:hover { background: #dfe6e9; }
.tab.active { background: #2c3e50; color: white; }
.tableSection { display: none; }
.tableSection.active { display: block; }
.tableTitle { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.tableTitle h2 { margin: 0; color: #2c3e50; }
.count { background: #ecf0f1; padding: 5px 10px; border-radius: 15px; font-size: 13px; }
.tableWrapper { overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th { background: #2c3e50; color: white; padding: 13px; text-align: left; }
td { padding: 12px 13px; border-bottom: 1px solid #eee; }
tr:hover { background: #f8f9fa; }
.empty { text-align: center; padding: 30px; color: #777; }
.actions { white-space: nowrap; }
.updateBtn, .deleteBtn { border: none; border-radius: 5px; padding: 7px 10px; cursor: pointer; font-size: 12px; font-weight: bold; margin-right: 4px; }
.updateBtn { background: #e67e22; color: white; }
.deleteBtn { background: #e74c3c; color: white; }
.panel { display: none; position: fixed; top: 70px; right: 25px; width: 360px; max-height: calc(100vh - 100px); overflow: auto; background: white; padding: 22px; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.25); z-index: 2000; }
.panel.open { display: block; }
.panel-close { position: absolute; right: 12px; top: 10px; border: none; background: none; font-size: 18px; cursor: pointer; }
.panel h2 { margin-top: 0; }
.panel label { display: block; font-weight: bold; font-size: 13px; margin-top: 10px; }
.panel input, .panel select { width: 100%; padding: 9px; margin-top: 5px; }
.panel form button { width: 100%; margin-top: 15px; padding: 10px; border: none; border-radius: 5px; background: #27ae60; color: white; font-weight: bold; cursor: pointer; }
#chatPanel { width: 380px; }
#chatMessages { height: 280px; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin-bottom: 10px; background: #fafafa; }
#chatInputRow { display: flex; gap: 8px; }
#chatInput { flex: 1; }
#chatSend { padding: 9px 15px; border: none; background: #2c3e50; color: white; border-radius: 4px; cursor: pointer; }
</style>
</head>
<body>
<div id="topButtons">
  <button id="addBtn" class="topBtn">+ Ekle</button>
  <button id="chatBtn" class="topBtn">💬 Asistan</button>
</div>
<h1>Veritabanı Yönetimi</h1>
<div class="tabs">
  <button class="tab active" data-table="users">👥 Kullanıcılar (${users.length})</button>
  <button class="tab" data-table="devices">💻 Cihazlar (${devices.length})</button>
  <button class="tab" data-table="staff">👨‍💼 Görevliler (${staff.length})</button>
  <button class="tab" data-table="purchases">🛒 Satın Almalar (${purchases.length})</button>
  <button class="tab" data-table="assignments">🔗 Atamalar (${assignments.length})</button>
</div>
<section id="users" class="tableSection active">
  <div class="tableTitle"><h2>👥 Kullanıcılar</h2><span class="count">${users.length} kayıt</span></div>
  <div class="tableWrapper"><table><thead><tr><th>ID</th><th>İsim</th><th>Doğum Tarihi</th><th>Cinsiyet</th><th>Meslek</th><th>İşlemler</th></tr></thead><tbody>${usersHtml()}</tbody></table></div>
</section>
<section id="devices" class="tableSection">
  <div class="tableTitle"><h2>💻 Cihazlar</h2><span class="count">${devices.length} kayıt</span></div>
  <div class="tableWrapper"><table><thead><tr><th>ID</th><th>Cihaz</th><th>Marka</th><th>Model</th><th>Seri No</th><th>Tür</th><th>Fiyat</th><th>İşlemler</th></tr></thead><tbody>${devicesHtml()}</tbody></table></div>
</section>
<section id="staff" class="tableSection">
  <div class="tableTitle"><h2>👨‍💼 Görevliler</h2><span class="count">${staff.length} kayıt</span></div>
  <div class="tableWrapper"><table><thead><tr><th>ID</th><th>İsim</th><th>Departman</th><th>Görev</th><th>Telefon</th><th>Email</th><th>İşlemler</th></tr></thead><tbody>${staffHtml()}</tbody></table></div>
</section>
<section id="purchases" class="tableSection">
  <div class="tableTitle"><h2>🛒 Satın Almalar</h2><span class="count">${purchases.length} kayıt</span></div>
  <div class="tableWrapper"><table><thead><tr><th>ID</th><th>Kullanıcı ID</th><th>Cihaz ID</th><th>Satın Alma Tarihi</th><th>Fiyat</th><th>Durum</th><th>İşlemler</th></tr></thead><tbody>${purchasesHtml()}</tbody></table></div>
</section>
<section id="assignments" class="tableSection">
  <div class="tableTitle"><h2>🔗 Görev Atamaları</h2><span class="count">${assignments.length} kayıt</span></div>
  <div class="tableWrapper"><table><thead><tr><th>ID</th><th>Görevli ID</th><th>Kullanıcı ID</th><th>Cihaz ID</th><th>Atama Tarihi</th><th>Durum</th><th>İşlemler</th></tr></thead><tbody>${assignmentsHtml()}</tbody></table></div>
</section>
<div id="formPanel" class="panel">
  <button class="panel-close" data-panel="formPanel">✕</button>
  <h2 id="formTitle">Yeni Kayıt</h2>
  <form id="recordForm"></form>
</div>
<div id="chatPanel" class="panel">
  <button class="panel-close" data-panel="chatPanel">✕</button>
  <h2>💬 Asistan</h2>
  <div id="chatMessages"></div>
  <div id="chatInputRow">
    <input id="chatInput" placeholder="Sorunuzu yazın...">
    <button id="chatSend">Gönder</button>
  </div>
</div>
<script>
const POST_URL = ${JSON.stringify(postUrl)};
const AGENT_URL = ${JSON.stringify(agentUrl)};
const SCHEMAS = {
  users: { title: "Kullanıcı", fields: [
    { name: "name", label: "İsim", type: "text", required: true },
    { name: "birthdate", label: "Doğum Tarihi", type: "date", required: true },
    { name: "gender", label: "Cinsiyet", type: "text", required: true },
    { name: "job", label: "Meslek", type: "text", required: true }
  ]},
  devices: { title: "Cihaz", fields: [
    { name: "device_name", label: "Cihaz adı", type: "text", required: true },
    { name: "brand", label: "Marka", type: "text" },
    { name: "model", label: "Model", type: "text" },
    { name: "serial_number", label: "Seri no", type: "text" },
    { name: "device_type", label: "Tür", type: "text" },
    { name: "price", label: "Fiyat", type: "number" }
  ]},
  staff: { title: "Görevli", fields: [
    { name: "name", label: "İsim", type: "text", required: true },
    { name: "department", label: "Departman", type: "text" },
    { name: "job", label: "Görev", type: "text" },
    { name: "phone", label: "Telefon", type: "text" },
    { name: "email", label: "Email", type: "email" }
  ]},
  purchases: { title: "Satın Alma", fields: [
    { name: "user_id", label: "Kullanıcı ID", type: "number", required: true },
    { name: "device_id", label: "Cihaz ID", type: "number", required: true },
    { name: "purchase_date", label: "Satın alma tarihi", type: "date", required: true },
    { name: "price", label: "Fiyat", type: "number" },
    { name: "status", label: "Durum", type: "text" }
  ]},
  staff_assignments: { title: "Atama", fields: [
    { name: "staff_id", label: "Görevli ID", type: "number", required: true },
    { name: "user_id", label: "Kullanıcı ID", type: "number", required: true },
    { name: "device_id", label: "Cihaz ID", type: "number" },
    { name: "assigned_date", label: "Atama tarihi", type: "date" },
    { name: "status", label: "Durum", type: "text" }
  ]}
};
const TAB_TO_TABLE = { users: "users", devices: "devices", staff: "staff", purchases: "purchases", assignments: "staff_assignments" };
let currentTab = "users";
function currentTable() { return TAB_TO_TABLE[currentTab] || "users"; }
function fieldValue(record, field) {
  if (!record) return "";
  const value = record[field.name];
  if (value == null) return "";
  if (field.type === "date") return String(value).split("T")[0];
  return value;
}
function renderForm(action, table, record) {
  const schema = SCHEMAS[table];
  document.getElementById("formTitle").textContent = action === "create" ? ("Yeni " + schema.title) : (schema.title + " güncelle");
  const fields = schema.fields.map(function(field) {
    return '<label>' + field.label + '</label><input type="' + field.type + '" name="' + field.name + '"' + (field.required ? " required" : "") + ' value="' + String(fieldValue(record, field)).replace(/"/g, "&quot;") + '">';
  }).join("");
  const idField = action === "update" ? '<input type="hidden" name="id" value="' + record.id + '">' : "";
  document.getElementById("recordForm").innerHTML = idField + '<input type="hidden" name="action" value="' + action + '"><input type="hidden" name="table" value="' + table + '">' + fields + '<button type="submit">' + (action === "create" ? "Ekle" : "Güncelle") + "</button>";
  document.getElementById("formPanel").classList.add("open");
  document.getElementById("chatPanel").classList.remove("open");
}
document.querySelectorAll(".tab").forEach(function(tab) {
  tab.addEventListener("click", function() {
    document.querySelectorAll(".tab").forEach(function(t) { t.classList.remove("active"); });
    document.querySelectorAll(".tableSection").forEach(function(section) { section.classList.remove("active"); });
    tab.classList.add("active");
    currentTab = tab.dataset.table;
    document.getElementById(currentTab).classList.add("active");
  });
});
document.getElementById("addBtn").addEventListener("click", function() {
  renderForm("create", currentTable(), null);
});
document.getElementById("chatBtn").addEventListener("click", function() {
  document.getElementById("formPanel").classList.remove("open");
  document.getElementById("chatPanel").classList.add("open");
});
document.querySelectorAll(".panel-close").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.getElementById(btn.dataset.panel).classList.remove("open");
  });
});
document.addEventListener("click", function(e) {
  const updateBtn = e.target.closest(".updateBtn");
  const deleteBtn = e.target.closest(".deleteBtn");
  if (updateBtn) {
    renderForm("update", updateBtn.dataset.table, JSON.parse(decodeURIComponent(updateBtn.dataset.record)));
  }
  if (deleteBtn) {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    sendAction({ action: "delete", table: deleteBtn.dataset.table, id: deleteBtn.dataset.id });
  }
});
document.getElementById("recordForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  sendAction(data);
});
async function sendAction(payload) {
  try {
    const response = await fetch(POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    location.reload();
  } catch (error) {
    console.error(error);
    alert("İşlem sırasında hata oluştu. n8n webhook çalışıyor mu?");
  }
}
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatMessages = document.getElementById("chatMessages");
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.style.margin = "8px 0";
  div.textContent = (sender === "user" ? "Sen: " : "Asistan: ") + text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
async function sendMessage() {
  const question = chatInput.value.trim();
  if (!question) return;
  addMessage(question, "user");
  chatInput.value = "";
  try {
    const response = await fetch(AGENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question })
    });
    const result = await response.json();
    addMessage(result.answer || "Cevap alınamadı.", "bot");
  } catch (error) {
    console.error(error);
    addMessage("Asistan şu anda kullanılamıyor.", "bot");
  }
}
chatSend.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", function(e) { if (e.key === "Enter") sendMessage(); });
</script>
</body>
</html>`;

return [{ json: { html } }];
