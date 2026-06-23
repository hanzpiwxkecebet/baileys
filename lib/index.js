"use strict";

const chalk = require("chalk");
const os = require("os");

/* ════════════════════════════════════════════════════════════════
   Konversi teks biasa -> Mathematical Sans-Serif Bold Italic
   Dibuat secara programatik (bukan hardcode) supaya karakter unicode
   selalu akurat dan tidak ada risiko salah ketik/transkripsi.
   ════════════════════════════════════════════════════════════════ */
function toFancyText(str) {
  const UPPER_BASE = 0x1d63c; // kode titik awal untuk huruf besar "A"
  const LOWER_BASE = 0x1d656; // kode titik awal untuk huruf kecil "a"
  let out = "";
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code >= 65 && code <= 90) {
      out += String.fromCodePoint(UPPER_BASE + (code - 65));
    } else if (code >= 97 && code <= 122) {
      out += String.fromCodePoint(LOWER_BASE + (code - 97));
    } else {
      out += ch; // spasi, angka, simbol dibiarkan apa adanya
    }
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════
   Util warna: interpolasi RGB linear antara 2 titik warna
   ════════════════════════════════════════════════════════════════ */
function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

/* Gradasi multi-titik (lebih dari 2 warna), t bernilai 0..1 */
function multiStopGradient(t, stops) {
  const segments = stops.length - 1;
  const segment = Math.min(Math.floor(t * segments), segments - 1);
  const localT = t * segments - segment;
  return lerpColor(stops[segment], stops[segment + 1], localT);
}

/* Mewarnai sekumpulan baris teks dengan gradasi vertikal (atas -> bawah) */
function paintGradientVertical(lines, stops) {
  const total = lines.length;
  return lines
    .map((line, i) => {
      const t = total <= 1 ? 0 : i / (total - 1);
      const [r, g, b] = multiStopGradient(t, stops);
      return chalk.rgb(r, g, b)(line);
    })
    .join("\n");
}

/* Membuat garis horizontal dengan gradasi warna kiri -> kanan */
function gradientRule(width, stops, char = "═") {
  let out = "";
  for (let i = 0; i < width; i++) {
    const t = width <= 1 ? 0 : i / (width - 1);
    const [r, g, b] = multiStopGradient(t, stops);
    out += chalk.rgb(r, g, b)(char);
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════
   Util panjang teks asli (tanpa kode ANSI & aman untuk karakter unicode
   astral seperti Mathematical Sans-Serif Bold Italic)
   ════════════════════════════════════════════════════════════════ */
function visibleLength(str) {
  const stripped = str.replace(/\x1b\[[0-9;]*m/g, "");
  return Array.from(stripped).length;
}

function padVisible(str, width) {
  const diff = width - visibleLength(str);
  return diff > 0 ? str + " ".repeat(diff) : str;
}

/* ════════════════════════════════════════════════════════════════
   Kotak info dinamis: lebar & alignment dihitung otomatis
   sesuai konten, jadi selalu rapi walau value berubah-ubah panjang.
   ════════════════════════════════════════════════════════════════ */
function buildInfoBox(title, rows) {
  const labelWidth = Math.max(...rows.map((r) => r.label.length));

  const bodyLines = rows.map((r) => {
    const label = chalk.cyanBright(r.label.padEnd(labelWidth, " "));
    return ` ${chalk.gray("▹")} ${label} ${chalk.gray(":")} ${r.value}`;
  });

  const contentWidth = Math.max(
    ...bodyLines.map((l) => visibleLength(l)),
    visibleLength(title) + 2
  );

  const border = chalk.magentaBright;
  const top = border("╭" + "─".repeat(contentWidth + 2) + "╮");
  const bottom = border("╰" + "─".repeat(contentWidth + 2) + "╯");
  const sep = border("├" + "─".repeat(contentWidth + 2) + "┤");

  const titleLine =
    border("│ ") + padVisible(chalk.bold.whiteBright(title), contentWidth) + border(" │");

  const wrappedBody = bodyLines.map(
    (l) => border("│ ") + padVisible(l, contentWidth) + border(" │")
  );

  return [top, titleLine, sep, ...wrappedBody, bottom].join("\n");
}

/* ════════════════════════════════════════════════════════════════
   Palet warna hologram (selaras dengan tema cyan/electric blue/purple)
   ════════════════════════════════════════════════════════════════ */
const HOLO_STOPS = [
  [0, 255, 255], // cyan
  [0, 153, 255], // electric blue
  [170, 0, 255], // purple
];

/* ASCII art (dipertahankan persis seperti aslinya) */
const asciiArtLines = `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⣶⣶⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣤⣤⣄⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡿⠟⠋⠁⠀⠀⠀⠀⠀⠈⠉⠛⠦⣄⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢠⡼⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢦⣶⣶⣶⣦⣄⠀
⠀⠀⠀⠀⠀⠀⠀⢠⡟⠀⠀⠀⠀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⣿⣦
⠀⢀⣀⣀⡀⠀⠀⡿⠀⠀⢀⣴⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⡟
⢀⣿⣿⣿⣿⣦⣄⡇⠈⠋⢸⣿⣿⣯⣼⠏⠀⠀⠀⠀⠀⢀⣰⣦⣄⠀⠀⠀⠀⢹⡿⠋⠀
⠈⣿⣿⣿⣿⣿⣿⣿⠀⠀⢀⣙⠛⠛⠁⠀⠀⣦⣤⡀⠀⣾⡟⣿⣿⣷⠀⠀⠀⢸⠂⠀⠀
⠀⠹⣿⣿⣿⣿⣿⣿⣧⡀⠉⠁⠀⠀⠀⠻⣤⣿⣉⣩⠀⠹⣷⣿⣿⡿⠀⠀⠀⣼⠀⠀⠀
⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣶⣄⡀⠀⠀⠀⠀⠈⠉⠁⠀⠀⢨⡉⠉⠀⢸⠀⣼⠃⠀⠀⠀
⠀⠀⠀⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣄⣀⠀⠀⠀⠀⠀⠀⠑⠆⠀⣠⡾⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠙⡟⠛⠻⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣶⣶⣿⣏⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢰⠃⠀⠀⠀⠀⠀⠀⠀⠉⠛⠛⠿⢿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢹⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠈⣿⣿⣷⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⣿⣿⠈⠙⠛⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⡗⠒⠶⠤⠤⣶⣶⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠙⠿⠿⠿⠃⠀⠀⠀⠀⠀⠀⠙⠿⠿⠟⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`
  .replace(/^\n/, "")
  .split("\n");

const RULE_WIDTH = 58;

/* ════════════════════════════════════════════════════════════════
   RENDER BANNER
   ════════════════════════════════════════════════════════════════ */
console.log("\n" + gradientRule(RULE_WIDTH, HOLO_STOPS));
console.log("");
console.log(paintGradientVertical(asciiArtLines, HOLO_STOPS));

const fancyBrand = toFancyText("HANZPIW BAILEYS");
console.log(
  "\n" +
    chalk.gray("¤═―— ") +
    chalk.bold.whiteBright(fancyBrand) +
    chalk.gray(" ―—═¤") +
    "\n"
);

/* Data sistem real-time */
const memUsedMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
const totalRAMGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
const freeRAMGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
const platformMap = { win32: "Windows", linux: "Linux", darwin: "macOS" };
const platformName = platformMap[os.platform()] || os.platform();

console.log(
  buildInfoBox(toFancyText("System Info"), [
    { label: "Developer", value: chalk.greenBright("@hanzpiwofc") },
    { label: "Version", value: chalk.whiteBright("1.0") },
    { label: "Library", value: chalk.whiteBright("Baileys (Modified)") },
    {
      label: "Status",
      value: chalk.greenBright("● ") + chalk.bold.greenBright("Berhasil Tersambung"),
    },
    { label: "Node.js", value: chalk.whiteBright(process.version) },
    { label: "Platform", value: chalk.whiteBright(`${platformName} (${os.arch()})`) },
    {
      label: "RAM",
      value: chalk.whiteBright(`${memUsedMB} MB dipakai / ${freeRAMGB} GB bebas / ${totalRAMGB} GB total`),
    },
  ])
);

console.log("\n" + gradientRule(RULE_WIDTH, HOLO_STOPS) + "\n");

/* ════════════════════════════════════════════════════════════════
   KODE ASLI DI BAWAH INI TIDAK DIUBAH (export module Baileys)
   ════════════════════════════════════════════════════════════════ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeWASocket = void 0;
const Socket_1 = __importDefault(require("./Socket"));
exports.makeWASocket = Socket_1.default;
__exportStar(require("../WAProto"), exports);
__exportStar(require("./Utils"), exports);
__exportStar(require("./Types"), exports);
__exportStar(require("./Store"), exports);
__exportStar(require("./Defaults"), exports);
__exportStar(require("./WABinary"), exports);
__exportStar(require("./WAM"), exports);
__exportStar(require("./WAUSync"), exports);

exports.default = Socket_1.default;
