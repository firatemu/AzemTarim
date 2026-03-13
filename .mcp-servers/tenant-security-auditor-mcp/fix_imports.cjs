const fs = require('fs');
const path = require('path');

const baseDir = '/home/azem/projects/otomuhasebe/api-stage/server/src/modules';

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('import { TenantResolverService }')) {
                const relativePath = path.relative(path.dirname(fullPath), '/home/azem/projects/otomuhasebe/api-stage/server/src/common/services/tenant-resolver.service');
                // Remove .ts extension and fix formatting
                const correctedPath = relativePath.replace(/\.ts$/, '').replace(/\\/g, '/');

                content = content.replace(/import { TenantResolverService } from '.*';/, `import { TenantResolverService } from '${correctedPath}';`);
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

walk(baseDir);
