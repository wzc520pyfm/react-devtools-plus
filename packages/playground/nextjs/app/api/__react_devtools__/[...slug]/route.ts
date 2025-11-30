import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import {
  createPluginsMiddleware,
  createPluginFileMiddleware,
  createOpenInEditorMiddleware,
  resolvePluginConfig,
  getClientPath
} from 'react-devtools';

// Plugin configuration
const pluginOptions = {
  enabledEnvironments: ['development', 'production'],
  plugins: [
    {
      name: 'my-plugin-nextjs',
      view: {
        title: 'My Plugin (Next.js)',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>',
        src: path.resolve(process.cwd(), './src/plugins/MyPlugin.jsx'),
      },
    },
  ],
};

// Resolve config
const projectRoot = process.cwd();
const devToolsConfig = resolvePluginConfig(pluginOptions, projectRoot, 'development', 'serve');
const clientPath = getClientPath(path.resolve(projectRoot, '../../react-devtools'));

// Content type mapping
const contentTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Handle plugins manifest
function handlePluginsManifest(): NextResponse | null {
  const plugins = devToolsConfig.plugins || [];
  const manifest = plugins.map(plugin => ({
    ...plugin,
    view: plugin.view ? {
      ...plugin.view,
      src: `/api/__react_devtools__/file?path=${encodeURIComponent(plugin.view.src)}`,
    } : undefined,
  }));
  
  return NextResponse.json(manifest);
}

// Handle plugin file
function handlePluginFile(filePath: string): NextResponse | null {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Simple transform: replace JSX and React imports
    // This is a simplified version - in production you'd use Babel
    const babel = require('@babel/core');
    const result = babel.transformSync(content, {
      presets: [
        ['@babel/preset-react', { runtime: 'classic' }],
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
      ],
      filename: filePath,
    });
    
    let code = result?.code || content;
    
    // Replace React imports with global React
    code = code.replace(/import\s+React\s*(?:,\s*\{[^}]*\})?\s*from\s*['"]react['"]\s*;?/g, 'const React = window.React;');
    code = code.replace(/import\s*\{([^}]*)\}\s*from\s*['"]react['"]\s*;?/g, (_, imports) => {
      const importList = imports.split(',').map((i: string) => i.trim()).filter(Boolean);
      return `const { ${importList.join(', ')} } = window.React;`;
    });
    
    return new NextResponse(code, {
      headers: { 'Content-Type': 'application/javascript' },
    });
  } catch (error) {
    console.error('Failed to transform plugin file:', error);
    return null;
  }
}

// Handle static file serving
function handleStaticFile(urlPath: string): NextResponse | null {
  // Default to index.html
  if (urlPath === '' || urlPath === '/') {
    urlPath = '/index.html';
  }
  
  const filePath = path.join(clientPath, urlPath);
  
  // Security check
  if (!filePath.startsWith(clientPath)) {
    return null;
  }
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    return new NextResponse(content, {
      headers: { 'Content-Type': contentTypes[ext] || 'application/octet-stream' },
    });
  }
  
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  const urlPath = '/' + slug.join('/');
  const searchParams = request.nextUrl.searchParams;
  
  // Handle plugins manifest
  if (urlPath === '/plugins-manifest.json') {
    return handlePluginsManifest();
  }
  
  // Handle plugin file
  if (urlPath === '/file') {
    const filePath = searchParams.get('path');
    if (filePath) {
      const response = handlePluginFile(filePath);
      if (response) return response;
    }
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  
  // Handle open-in-editor (just acknowledge for now)
  if (urlPath === '/open-in-editor') {
    const file = searchParams.get('file');
    if (file) {
      // In a real implementation, this would open the file in the editor
      console.log('Open in editor:', file);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'No file specified' }, { status: 400 });
  }
  
  // Serve static files from client
  const response = handleStaticFile(urlPath);
  if (response) return response;
  
  // Fallback: serve index.html for SPA routing
  const indexPath = path.join(clientPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath);
    return new NextResponse(content, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  const urlPath = '/' + slug.join('/');
  
  // Handle open-in-editor POST
  if (urlPath === '/open-in-editor') {
    const body = await request.json().catch(() => ({}));
    const file = body.file;
    if (file) {
      console.log('Open in editor:', file);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'No file specified' }, { status: 400 });
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

