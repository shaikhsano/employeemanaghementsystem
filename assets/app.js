/* Shree Balaji — Employee Management System
   Shared logic for every page. Data is saved in the browser (localStorage),
   so the site works as plain static files on AWS S3 / Amplify with no server. */
(function () {
  "use strict";

  var KEY = "sb_ems_data_v1";
  var SESSION = "sb_ems_session";

  /* ---------- Helpers ---------- */
  function pad(n) { return String(n).padStart(2, "0"); }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseDate(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2] || 1); }
  function today() { return ymd(new Date()); }
  function thisMonth() { return today().slice(0, 7); }
  function addDays(s, n) { var d = parseDate(s); d.setDate(d.getDate() + n); return ymd(d); }
  function inr(n) { return "\u20B9" + Math.round(n || 0).toLocaleString("en-IN"); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid(p) { return (p || "") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function fmtDate(s) { if (!s) return "—"; var d = parseDate(s); return pad(d.getDate()) + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); }
  function fmtMonth(m) { var p = m.split("-"); return MONTHS_FULL[+p[1] - 1] + " " + p[0]; }
  function daysBetween(from, to) {
    // inclusive, excluding Sundays
    var out = [], d = parseDate(from), end = parseDate(to);
    while (d <= end) { if (d.getDay() !== 0) out.push(ymd(d)); d.setDate(d.getDate() + 1); }
    return out;
  }

  /* ---------- Icons ---------- */
  var I = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    attendance: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    leave: '<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M10 14l2 2 4-4"/>',
    rupee: '<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3c6.67 0 6.67-10 0-10"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    menu: '<path d="M3 12h18M3 6h18M3 18h18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    printer: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  };
  function icon(n, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (I[n] || "") + "</svg>";
  }

  /* ---------- Demo data ---------- */
  function seed() {
    var departments = [
      { id: "D1", name: "Administration", head: "Rajesh Agarwal", description: "Management and office administration" },
      { id: "D2", name: "Sales", head: "Amit Verma", description: "Customer relations and sales" },
      { id: "D3", name: "Accounts", head: "Sneha Gupta", description: "Billing, GST and finance" },
      { id: "D4", name: "Operations", head: "Vikram Singh", description: "Day-to-day business operations" },
      { id: "D5", name: "Warehouse", head: "Rohit Jain", description: "Stock, storage and dispatch" },
      { id: "D6", name: "Human Resources", head: "Priya Sharma", description: "Hiring, payroll and staff welfare" },
    ];
    var rows = [
      ["Rajesh Agarwal", "D1", "General Manager", "Male", "9830012345", "2015-04-01", "1978-08-12", 45000, 18000, 7000],
      ["Priya Sharma", "D6", "HR Executive", "Female", "9830023456", "2019-07-15", "1992-03-22", 22000, 8800, 3200],
      ["Amit Verma", "D2", "Sales Manager", "Male", "9830034567", "2017-01-10", "1986-11-05", 32000, 12800, 5200],
      ["Sneha Gupta", "D3", "Senior Accountant", "Female", "9830045678", "2018-06-01", "1990-01-30", 28000, 11200, 3800],
      ["Vikram Singh", "D4", "Operations Lead", "Male", "9830056789", "2016-09-20", "1984-05-14", 30000, 12000, 4000],
      ["Pooja Das", "D2", "Sales Executive", "Female", "9830067890", "2021-02-01", "1996-07-09", 16000, 6400, 2100],
      ["Rohit Jain", "D5", "Warehouse Supervisor", "Male", "9830078901", "2018-11-12", "1988-12-19", 20000, 8000, 2500],
      ["Anjali Mehta", "D3", "Accounts Assistant", "Female", "9830089012", "2022-04-18", "1998-09-02", 14000, 5600, 1900],
      ["Suresh Yadav", "D5", "Store Keeper", "Male", "9830090123", "2020-08-05", "1991-04-25", 13000, 5200, 1800],
      ["Kavita Banerjee", "D1", "Office Administrator", "Female", "9830101234", "2019-03-11", "1993-10-16", 18000, 7200, 2300],
      ["Manoj Tiwari", "D4", "Logistics Coordinator", "Male", "9830112345", "2021-10-25", "1994-06-07", 17000, 6800, 2200],
      ["Neha Kapoor", "D2", "Sales Executive", "Female", "9830123456", "2023-01-16", "1999-02-28", 15000, 6000, 2000],
    ];
    var employees = rows.map(function (r, i) {
      return {
        id: "E" + (i + 1), code: "SB" + (1001 + i), name: r[0], dept: r[1], designation: r[2], gender: r[3],
        phone: r[4], email: r[0].split(" ")[0].toLowerCase() + "@shreebalaji.in", joinDate: r[5], dob: r[6],
        basic: r[7], hra: r[8], allowance: r[9], status: "Active", address: "", bank: "", ifsc: "", pan: "",
      };
    });
    var attendance = {}, t = today();
    for (var i = 0; i <= 24; i++) {
      var key = addDays(t, -i);
      if (parseDate(key).getDay() === 0) continue;
      attendance[key] = {};
      employees.forEach(function (e, j) {
        var r = (i * 7 + j * 13) % 23;
        attendance[key][e.id] = r === 0 ? "A" : r === 5 ? "H" : r === 11 ? "L" : "P";
      });
    }
    var leaves = [
      { id: "L1", empId: "E6", type: "Casual Leave", from: addDays(t, 2), to: addDays(t, 3), reason: "Family function", status: "Pending", appliedOn: addDays(t, -1) },
      { id: "L2", empId: "E2", type: "Earned Leave", from: addDays(t, 10), to: addDays(t, 14), reason: "Travelling to hometown", status: "Pending", appliedOn: t },
      { id: "L3", empId: "E9", type: "Sick Leave", from: addDays(t, -6), to: addDays(t, -5), reason: "Fever", status: "Approved", appliedOn: addDays(t, -7) },
      { id: "L4", empId: "E11", type: "Casual Leave", from: addDays(t, -12), to: addDays(t, -12), reason: "Personal work", status: "Rejected", appliedOn: addDays(t, -14) },
    ];
    return {
      company: { name: "Shree Balaji", tagline: "Employee Management System", address: "", phone: "", email: "" },
      admin: { username: "admin", password: "admin123", name: "Administrator" },
      departments: departments, employees: employees, attendance: attendance, leaves: leaves, payroll: {},
    };
  }

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && d.employees) return d;
    } catch (e) { /* ignore */ }
    var s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  var db = load();
  function save() { localStorage.setItem(KEY, JSON.stringify(db)); }
  function reset() { localStorage.removeItem(KEY); db = load(); EMS.db = db; }

  /* ---------- Lookups ---------- */
  function emp(id) { return db.employees.find(function (e) { return e.id === id; }); }
  function dept(id) { return db.departments.find(function (d) { return d.id === id; }); }
  function deptName(id) { var d = dept(id); return d ? d.name : "—"; }
  function onLeave(empId, date) {
    return db.leaves.some(function (l) { return l.empId === empId && l.status === "Approved" && l.from <= date && l.to >= date; });
  }

  /* ---------- Salary rules ----------
     Gross = Basic + HRA + Allowance
     PF = 12% of Basic, Professional Tax = ₹200 when Gross >= ₹15,000
     Loss of pay = (Gross / 30) x (Absent days + 0.5 x Half days)
     Net = Gross + Bonus - PF - PT - Loss of pay - Other deductions */
  function salaryFor(e, month) {
    var basic = +e.basic || 0, hra = +e.hra || 0, allowance = +e.allowance || 0;
    var gross = basic + hra + allowance;
    var c = { P: 0, A: 0, H: 0, L: 0 };
    Object.keys(db.attendance).forEach(function (date) {
      if (date.slice(0, 7) === month) { var s = db.attendance[date][e.id]; if (c[s] != null) c[s]++; }
    });
    var lopDays = c.A + c.H * 0.5;
    var lop = Math.round((gross / 30) * lopDays);
    var pf = Math.round(basic * 0.12);
    var pt = gross >= 15000 ? 200 : 0;
    var rec = (db.payroll[month] || {})[e.id] || {};
    var bonus = +rec.bonus || 0, otherDed = +rec.otherDed || 0;
    var deductions = pf + pt + lop + otherDed;
    return {
      basic: basic, hra: hra, allowance: allowance, gross: gross, bonus: bonus, pf: pf, pt: pt, lop: lop, lopDays: lopDays,
      otherDed: otherDed, deductions: deductions, net: Math.max(0, gross + bonus - deductions),
      present: c.P, absent: c.A, half: c.H, leave: c.L, status: rec.status || "Pending", paidOn: rec.paidOn || "", note: rec.note || "",
    };
  }
  function setPayroll(month, empId, patch) {
    db.payroll[month] = db.payroll[month] || {};
    db.payroll[month][empId] = Object.assign({}, db.payroll[month][empId] || {}, patch);
    save();
  }

  function numberToWords(num) {
    var n = Math.round(num);
    if (n === 0) return "Zero";
    var a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    var b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    function two(x) { return x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : ""); }
    function three(x) { return x >= 100 ? a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + two(x % 100) : "") : two(x); }
    var out = [];
    var cr = Math.floor(n / 1e7); n %= 1e7;
    var lk = Math.floor(n / 1e5); n %= 1e5;
    var th = Math.floor(n / 1000); n %= 1000;
    if (cr) out.push(three(cr) + " Crore");
    if (lk) out.push(two(lk) + " Lakh");
    if (th) out.push(two(th) + " Thousand");
    if (n) out.push(three(n));
    return out.join(" ");
  }

  /* ---------- Auth ---------- */
  function login(u, p) {
    if (String(u).trim() === db.admin.username && p === db.admin.password) {
      sessionStorage.setItem(SESSION, JSON.stringify({ u: u, at: Date.now() }));
      return true;
    }
    return false;
  }
  function isLoggedIn() { return !!sessionStorage.getItem(SESSION); }
  function logout() { sessionStorage.removeItem(SESSION); location.href = "login.html"; }

  /* ---------- Layout ---------- */
  var NAV = [
    ["dashboard", "Dashboard", "dashboard.html", "dashboard"],
    ["employees", "Employees", "employees.html", "users"],
    ["attendance", "Attendance", "attendance.html", "attendance"],
    ["leave", "Leave", "leave.html", "leave"],
    ["salary", "Salary & Payroll", "salary.html", "rupee"],
    ["departments", "Departments", "departments.html", "building"],
    ["settings", "Settings", "settings.html", "settings"],
  ];

  function shell(active, title, subtitle) {
    if (!isLoggedIn()) { location.replace("login.html"); return false; }
    document.title = title + " · " + db.company.name + " EMS";
    var nav = NAV.map(function (n) {
      return '<a href="' + n[2] + '" class="' + (n[0] === active ? "active" : "") + '">' + icon(n[3]) + "<span>" + n[1] + "</span></a>";
    }).join("");
    document.body.insertAdjacentHTML("afterbegin",
      '<aside class="sidebar" id="sidebar">' +
        '<div class="brand"><div class="logo">' + esc(initials(db.company.name)) + '</div><div><div class="brand-name">' + esc(db.company.name) + '</div><div class="brand-sub">Employee Management</div></div></div>' +
        '<div class="nav-label">Menu</div><nav class="nav">' + nav + "</nav>" +
        '<div class="sidebar-foot"><button type="button" id="logoutBtn">' + icon("logout") + "<span>Log out</span></button></div>" +
      '</aside><div class="scrim" id="scrim"></div><div class="toast-wrap" id="toasts"></div>');
    var top = document.getElementById("topbar");
    if (top) {
      top.innerHTML =
        '<button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu">' + icon("menu") + "</button>" +
        "<div><h1>" + esc(title) + "</h1>" + (subtitle ? "<p>" + esc(subtitle) + "</p>" : "") + "</div>" +
        '<div class="user-chip"><div class="who"><b>' + esc(db.admin.name) + "</b><small>" + esc(db.admin.username) + '</small></div><div class="avatar">' + esc(initials(db.admin.name)) + "</div></div>";
    }
    var sb = document.getElementById("sidebar"), scrim = document.getElementById("scrim");
    function toggle(open) { sb.classList.toggle("open", open); scrim.classList.toggle("show", open); }
    var mb = document.getElementById("menuBtn");
    if (mb) mb.onclick = function () { toggle(true); };
    scrim.onclick = function () { toggle(false); };
    document.getElementById("logoutBtn").onclick = logout;
    return true;
  }

  function statCard(label, value, hint, ic, tone) {
    return '<div class="card stat ' + (tone || "tone-maroon") + '"><div class="ico">' + icon(ic) + '</div><div class="label">' + esc(label) +
      '</div><div class="value">' + value + '</div><div class="hint">' + (hint || "") + "</div></div>";
  }

  function personCell(e, sub) {
    if (!e) return '<span class="note">Removed employee</span>';
    return '<div class="person"><div class="avatar sm">' + esc(initials(e.name)) + "</div><div><b>" + esc(e.name) + "</b><small>" + esc(sub != null ? sub : e.code + " · " + e.designation) + "</small></div></div>";
  }

  function badge(text) {
    var map = { Active: "b-green", Approved: "b-green", Paid: "b-green", Present: "b-green", Pending: "b-amber", "Half Day": "b-amber", Rejected: "b-red", Inactive: "b-gray", Absent: "b-red", Leave: "b-blue" };
    return '<span class="badge ' + (map[text] || "b-gray") + '">' + esc(text) + "</span>";
  }

  /* ---------- Modal & toast ---------- */
  function modal(opts) {
    var dlg = document.getElementById("ems-modal");
    if (!dlg) { dlg = document.createElement("dialog"); dlg.id = "ems-modal"; dlg.className = "modal"; document.body.appendChild(dlg); }
    dlg.classList.toggle("wide", !!opts.wide);
    dlg.innerHTML = '<div class="modal-head"><h3>' + esc(opts.title) + '</h3><button class="icon-btn" type="button" data-close aria-label="Close">' + icon("x") + "</button></div>" +
      '<div class="modal-body">' + opts.body + "</div>" + (opts.footer ? '<div class="modal-foot">' + opts.footer + "</div>" : "");
    dlg.querySelectorAll("[data-close]").forEach(function (b) { b.onclick = function () { dlg.close(); }; });
    dlg.onclick = function (ev) { if (ev.target === dlg) dlg.close(); };
    if (!dlg.open) dlg.showModal();
    return dlg;
  }
  function closeModal() { var d = document.getElementById("ems-modal"); if (d && d.open) d.close(); }
  function toast(msg, type) {
    var w = document.getElementById("toasts");
    if (!w) { w = document.createElement("div"); w.id = "toasts"; w.className = "toast-wrap"; document.body.appendChild(w); }
    var t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.innerHTML = icon(type === "error" ? "alert" : "checkCircle") + "<span>" + esc(msg) + "</span>";
    w.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; t.style.transition = "opacity .3s"; }, 2400);
    setTimeout(function () { t.remove(); }, 2800);
  }
  function formData(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) { o[k] = typeof v === "string" ? v.trim() : v; });
    return o;
  }
  function deptOptions(selected, withAll) {
    return (withAll ? '<option value="">All departments</option>' : "") +
      db.departments.map(function (d) { return '<option value="' + d.id + '"' + (d.id === selected ? " selected" : "") + ">" + esc(d.name) + "</option>"; }).join("");
  }
  function downloadFile(name, content, type) {
    var blob = new Blob([content], { type: type || "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function toCSV(rows) {
    return rows.map(function (r) { return r.map(function (c) { var s = String(c == null ? "" : c); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(","); }).join("\n");
  }

  window.EMS = {
    get db() { return db; }, set db(v) { db = v; },
    save: save, reset: reset, seed: seed, KEY: KEY,
    today: today, thisMonth: thisMonth, addDays: addDays, parseDate: parseDate, ymd: ymd, pad: pad,
    fmtDate: fmtDate, fmtMonth: fmtMonth, daysBetween: daysBetween, MONTHS: MONTHS,
    inr: inr, esc: esc, uid: uid, initials: initials, icon: icon,
    emp: emp, dept: dept, deptName: deptName, onLeave: onLeave,
    salaryFor: salaryFor, setPayroll: setPayroll, numberToWords: numberToWords,
    login: login, logout: logout, isLoggedIn: isLoggedIn,
    shell: shell, statCard: statCard, personCell: personCell, badge: badge,
    modal: modal, closeModal: closeModal, toast: toast, formData: formData, deptOptions: deptOptions,
    downloadFile: downloadFile, toCSV: toCSV,
  };
})();
