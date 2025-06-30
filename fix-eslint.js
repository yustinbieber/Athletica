import fs from 'fs';
import path from 'path';

const filesToFix = [
  'app/admin/page.tsx',
  'app/api/empleados/route.ts',
  'app/api/gimnasios/route.ts',
  'app/api/gym-login/route.ts',
  'app/api/mercaderia/route.ts',
  'app/gym-dashboard/page.tsx',
  'app/gym-dashboard/seleccionar-empleado/page.tsx',
  'components/gym/UsuariosContent.tsx',
  'lib/mongodb.ts'
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Eliminar variables no usadas: token, error, SetStateAction, gymId
  content = content.replace(/const \[token, setToken\][^;]*;/g, '');
  content = content.replace(/import\s*\{\s*SetStateAction\s*\}\s*from\s*['"]react['"];\s*/g, '');
  content = content.replace(/const gymId = [^;]*;/g, '');

  // 2. Cambiar catch(error) a catch si no se usa error
  content = content.replace(/catch\s*\(\s*error\s*\)\s*\{/g, 'catch {');

  // 3. Cambiar let cached a const cached en lib/mongodb.ts
  if (filePath.endsWith('lib/mongodb.ts')) {
    content = content.replace(/let cached:/, 'const cached:');
  }

  // 4. En app/admin/page.tsx agregar router en dependencias de useEffect
  if (filePath.endsWith('app/admin/page.tsx')) {
    content = content.replace(/useEffect\(\(\) => {([\s\S]*?)}\s*, \[\]\);/, (match, p1) => {
      if (p1.includes('router')) return match;
      return `useEffect(() => {${p1}}, [router]);`;
    });
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixes applied to ${filePath}`);
}

function main() {
  for (const relativePath of filesToFix) {
    const fullPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {
      fixFile(fullPath);
    } else {
      console.warn(`File not found: ${relativePath}`);
    }
  }
}

main();
