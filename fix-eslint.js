const fs = require('fs');
const path = require('path');

const apiDir = path.resolve('./app/api');

function fixCatchErrorsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  content = content.replace(/catch\s*\(\s*error\s*\)\s*{([\s\S]*?)}/g, (match, catchBody) => {
    if (!catchBody.includes('error')) {
      return `catch {${catchBody}}`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Corregido catch en ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.ts')) {
      fixCatchErrorsInFile(fullPath);
    }
  }
}

walkDir(apiDir);
