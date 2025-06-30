const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Cambiar catch (error) { ... } por catch { ... }
  content = content.replace(/catch\s*\(\s*\w+\s*\)\s*{/g, 'catch {');

  // 2. Cambiar let a const si no hay reasignación (muy básico, solo líneas simples)
  content = content.replace(/^(\s*)let (\w+) =/gm, (match, indent, varName) => {
    // Para evitar falsos positivos, solo cambiar si no aparece reasignación
    const regexReassign = new RegExp(`\\b${varName}\\s*=`, 'g');
    const matches = content.match(regexReassign);
    if (matches && matches.length === 1) {
      return `${indent}const ${varName} =`;
    }
    return match;
  });

  // 3. Eliminar declaración de variables no usadas simples (const o let), solo si se detecta que no se usa
  // NOTA: Esto es complicado hacer sin AST, esta es una versión simple para variables declaradas sin uso
  // Ejemplo: const token = ...;  -> eliminar si no se usa
  // Aquí no implementado por complejidad. Mejor usar ESLint autofix.

  // 4. Agregar prefijo _ a variables declaradas pero no usadas (no cubre casos complejos)
  // Ejemplo de variable token no usada declarada en línea: const token = ...
  // Puedes buscar variables declaradas y cambiar token por _token, etc.
  // Esto es complejo sin parser, te recomiendo ESLint autofix para este punto.

  // 5. Opcional: eliminar eslint-disable sin uso
  // No implementado por la complejidad de análisis de código.

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Archivo corregido: ${filePath}`);
}

// Ejecutar en una carpeta recursivamente (cambia ./app por tu carpeta)
function fixFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fixFolder(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      fixFile(fullPath);
    }
  }
}

// Cambiar "./app" por la carpeta raíz de tu proyecto
fixFolder('./app');
