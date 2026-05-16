// ── Temp folder auto-create ──
const fs = require("fs-extra");
fs.ensureDirSync("./temp");
fs.ensureDirSync("./auth_info");
