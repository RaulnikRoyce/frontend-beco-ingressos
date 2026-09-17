const fs = require('fs');
const path = require('path');

const apiUrl = process.env.VITE_API_URL;

if (!apiUrl) {
    process.exit(0);
}

const vercelJsonPath = path.join(__dirname, '..', 'vercel.json');
const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
const header = (config.headers || [])
    .flatMap((bloco) => bloco.headers || [])
    .find((h) => h.key === 'Content-Security-Policy');

if (!header || !header.value.includes(apiUrl)) {
    console.error(
        `\nERRO: VITE_API_URL="${apiUrl}" não está no connect-src de vercel.json.\n` +
        'Atualize o bloco connect-src do Content-Security-Policy em vercel.json ' +
        'para incluir essa URL — senão o navegador vai bloquear todas as chamadas ' +
        'da API assim que isso for pro ar.\n'
    );
    process.exit(1);
}

console.log(`vercel.json: connect-src já inclui VITE_API_URL (${apiUrl}). OK.`);
