import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'os';

const PLUGINS_DIR = path.join(os.homedir(), '.vibe-code', 'plugins');
let loadedPlugins = new Map();

export async function ensurePluginsDir() {
  try {
    await fs.mkdir(PLUGINS_DIR, { recursive: true });
  } catch (e) {
    // Ignore
  }
}

export async function loadPlugins() {
  await ensurePluginsDir();
  loadedPlugins.clear();
  
  try {
    const files = await fs.readdir(PLUGINS_DIR);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const fullPath = path.join(PLUGINS_DIR, file);
        try {
          // Use a cache-busting query param so reload works
          const plugin = await import(`file://${fullPath}?t=${Date.now()}`);
          if (plugin.toolDefinition && plugin.execute) {
            loadedPlugins.set(plugin.toolDefinition.function.name, plugin);
          }
        } catch (e) {
          console.error(`[Plugin Error] Failed to load ${file}:`, e.message);
        }
      }
    }
  } catch (e) {
    console.error('[Plugin Error] Could not read plugins directory:', e.message);
  }
}

export function getPluginTools() {
  return Array.from(loadedPlugins.values()).map(p => p.toolDefinition);
}

export function getPluginNames() {
  return Array.from(loadedPlugins.keys());
}

export async function executePluginTool(name, args) {
  const plugin = loadedPlugins.get(name);
  if (!plugin) {
    throw new Error(`Plugin tool ${name} not found.`);
  }
  return await plugin.execute(args);
}
