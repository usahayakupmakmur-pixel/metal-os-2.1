
export interface KernelModule {
  id: string;
  name: string;
  version: string;
  description: string;
  status: 'LOADED' | 'UNLOADED' | 'ERROR';
  type: 'DRIVER' | 'SYSTEM' | 'USERLAND';
}

export interface KernelMessage {
  sourceId: string;
  targetId: string;
  payload: string;
  timestamp: number;
}

export interface FileNode {
  name: string;
  isDirectory: boolean;
  content?: string;
  children?: Map<string, FileNode>;
  createdAt: number;
  updatedAt: number;
}

class KernelService {
  private modules: Map<string, KernelModule>;
  private eventLog: string[];
  private root: FileNode;

  constructor() {
    this.modules = new Map([
      ['core_gov', { id: 'core_gov', name: 'GlassHouse Governance', version: '1.2.0', description: 'Core transparency module for APBDes', status: 'LOADED', type: 'SYSTEM' }],
      ['net_warga', { id: 'net_warga', name: 'Warga-Net Protocol', version: '0.9.5', description: 'Mesh network connectivity driver', status: 'LOADED', type: 'DRIVER' }],
      ['pay_sys', { id: 'pay_sys', name: 'WargaPay Payment Gateway', version: '2.1.0', description: 'Financial transaction processor', status: 'LOADED', type: 'SYSTEM' }],
      ['env_sense', { id: 'env_sense', name: 'EnviroSense IoT Driver', version: '1.0.1', description: 'Driver for flood and air quality sensors', status: 'LOADED', type: 'DRIVER' }],
      ['ai_cog', { id: 'ai_cog', name: 'Cognitive Assistant (Gemini)', version: '3.0.0', description: 'Natural language processing unit', status: 'LOADED', type: 'USERLAND' }],
    ]);
    this.eventLog = [];
    
    // Initialize File System
    this.root = {
      name: '/',
      isDirectory: true,
      children: new Map(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Seed some initial files
    this.mkdir('/system/config');
    this.writeFile('/system/config/os.json', JSON.stringify({ name: 'MetalOS', version: '2.1.0' }));
    this.mkdir('/user/documents');
    this.writeFile('/user/documents/welcome.txt', 'Welcome to MetalOS: Cognitive Governance Dashboard.');
  }

  // --- File System Methods ---

  private getPathParts(path: string): string[] {
    return path.split('/').filter(p => p.length > 0);
  }

  private traverse(path: string): FileNode | null {
    const parts = this.getPathParts(path);
    let current = this.root;
    for (const part of parts) {
      if (!current.isDirectory || !current.children?.has(part)) {
        return null;
      }
      current = current.children.get(part)!;
    }
    return current;
  }

  mkdir(path: string): boolean {
    const parts = this.getPathParts(path);
    let current = this.root;
    for (const part of parts) {
      if (!current.children) current.children = new Map();
      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          isDirectory: true,
          children: new Map(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      current = current.children.get(part)!;
      if (!current.isDirectory) throw new Error(`'${part}' is a file, not a directory`);
    }
    return true;
  }

  writeFile(path: string, content: string): boolean {
    const parts = this.getPathParts(path);
    if (parts.length === 0) throw new Error("Cannot write to root");

    const fileName = parts.pop()!;
    const dirPath = parts.join('/');
    const parent = dirPath === '' ? this.root : this.traverse(dirPath);

    if (!parent || !parent.isDirectory) throw new Error(`Directory not found: ${dirPath}`);
    if (!parent.children) parent.children = new Map();

    const existing = parent.children.get(fileName);
    if (existing && existing.isDirectory) throw new Error(`'${fileName}' is a directory`);

    parent.children.set(fileName, {
      name: fileName,
      isDirectory: false,
      content,
      createdAt: existing ? existing.createdAt : Date.now(),
      updatedAt: Date.now()
    });

    return true;
  }

  readFile(path: string): string {
    const node = this.traverse(path);
    if (!node) throw new Error(`File not found: ${path}`);
    if (node.isDirectory) throw new Error(`'${path}' is a directory`);
    return node.content || '';
  }

  ls(path: string = '/'): string[] {
    const node = this.traverse(path);
    if (!node) throw new Error(`Directory not found: ${path}`);
    if (!node.isDirectory) throw new Error(`'${path}' is a file`);
    return Array.from(node.children?.keys() || []);
  }

  rm(path: string): boolean {
    const parts = this.getPathParts(path);
    if (parts.length === 0) throw new Error("Cannot delete root");

    const targetName = parts.pop()!;
    const dirPath = parts.join('/');
    const parent = dirPath === '' ? this.root : this.traverse(dirPath);

    if (parent && parent.children?.has(targetName)) {
      parent.children.delete(targetName);
      return true;
    }
    return false;
  }

  // --- Original Kernel Methods ---

  getModules(): KernelModule[] {
    return Array.from(this.modules.values());
  }

  loadModule(id: string): boolean {
    const mod = this.modules.get(id);
    if (mod) {
      mod.status = 'LOADED';
      this.log(`Kernel: Loaded module [${mod.name}]`);
      return true;
    }
    return false;
  }

  unloadModule(id: string): boolean {
     const mod = this.modules.get(id);
    if (mod) {
      mod.status = 'UNLOADED';
      this.log(`Kernel: Unloaded module [${mod.name}]`);
      return true;
    }
    return false;
  }

  sendMessage(targetId: string, message: string): string {
    const mod = this.modules.get(targetId);
    
    if (!mod) {
      throw new Error(`Kernel Panic: Module ${targetId} not found`);
    }

    if (mod.status !== 'LOADED') {
      throw new Error(`Kernel Error: Module ${targetId} is not loaded`);
    }

    this.log(`IPC: Signal sent to ${targetId}`);
    return `ACK from ${mod.name}: Received "${message.substring(0, 15)}..."`;
  }

  private log(msg: string) {
    const entry = `[${new Date().toISOString()}] ${msg}`;
    this.eventLog.push(entry);
    if (this.eventLog.length > 50) this.eventLog.shift();
  }

  getLogs(): string[] {
    return [...this.eventLog];
  }
}

export const kernel = new KernelService();
