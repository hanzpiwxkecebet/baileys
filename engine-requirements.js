const major = parseInt(process.versions.node.split('.')[0], 10);

if (major < 20) {
  console.error(
    `\n Woi!! Versi Node.js lu jadul‼️\n` +
    `   Versi sekarang : ${process.versions.node}\n` +
    `   Minimal        : Node.js 20+\n\n` +
    `   Upgrade dulu biar ga error‼️\n`
  );
  process.exit(1);
}
