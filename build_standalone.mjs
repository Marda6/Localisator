#!/usr/bin/env node
// Собирает автономный localisator.html из dist/ (аналог build_standalone.py для машин без Python).
import {readFileSync, writeFileSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const read = name => readFileSync(join(dist, name), 'utf8');

const scripts = ['data.js', 'core.js', 'app.js'].map(name => {
  let src = read(name);
  src = src.replace(/^import [^\n]+;\s*\n/gm, '');
  src = src.replace(/^export (?=(?:const|function)\b)/gm, '');
  if (/^\s*(?:import|export)\b/m.test(src)) throw new Error(`Unsupported module syntax in ${name}`);
  return src;
});
let script = '(() => {\n"use strict";\n' + scripts.join('\n\n') + '\n})();\n';
script = script.replace(/<\/script/gi, '<\\/script');

// Шрифты в автономном файле не встраиваем: браузер откатится на system-ui.
let css = read('styles.css').replace(/^@font-face[^\n]*\n/gm, '');
if (/<\/style/i.test(css)) throw new Error('Inline CSS contains a closing style tag');

let html = read('index.html');
const styleTag = '<link rel="stylesheet" href="./styles.css">';
const scriptTag = '<script type="module" src="./app.js"></script>';
if (html.split(styleTag).length !== 2 || html.split(scriptTag).length !== 2) throw new Error('Unexpected HTML entrypoint structure');
html = html.replace(styleTag, '<style>\n' + css + '\n</style>').replace(scriptTag, '<script>\n' + script + '\n</script>');

const out = join(root, 'localisator.html');
writeFileSync(out, html, 'utf8');
console.log(`Created localisator.html (${statSync(out).size.toLocaleString('en-US')} bytes)`);
