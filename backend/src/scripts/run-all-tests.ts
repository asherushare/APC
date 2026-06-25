/* eslint-disable no-undef */
import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import path from 'path';

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;

async function isServerRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.end();
  });
}

function runScript(scriptPath: string): Promise<number> {
  return new Promise((resolve) => {
    console.log('\n--------------------------------------------------');
    console.log(`🏃 Running script: ${path.basename(scriptPath)}`);
    console.log('--------------------------------------------------');

    // On Windows, spawn shell correctly
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? 'npx.cmd' : 'npx';

    const child = spawn(cmd, ['ts-node', scriptPath], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..'),
      shell: true,
      env: { ...process.env, NODE_ENV: 'test' },
    });

    child.on('close', (code) => {
      resolve(code ?? 1);
    });
  });
}

async function main() {
  console.log('🧪 Starting Master Integration Test Runner...');

  let serverProcess: ChildProcess | null = null;
  const alreadyRunning = await isServerRunning();

  if (alreadyRunning) {
    console.log('🟢 Active API server detected on port 4000. Testing against running instance.');
  } else {
    console.log('🚀 No active server detected. Spawning backend dev server in background...');
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? 'npm.cmd' : 'npm';
    
    serverProcess = spawn(cmd, ['run', 'dev'], {
      cwd: path.join(__dirname, '../..'),
      env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
      shell: true,
    });

    serverProcess.stdout?.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) console.log(`[Server] ${line.trim()}`);
      }
    });

    serverProcess.stderr?.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) console.error(`[Server Error] ${line.trim()}`);
      }
    });

    // Wait for server to boot (health check success)
    let retries = 20;
    let booted = false;
    while (retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      const healthy = await isServerRunning();
      if (healthy) {
        booted = true;
        break;
      }
      retries--;
    }

    if (!booted) {
      console.error('❌ Server failed to start on port 4000 within 20 seconds. Aborting tests.');
      if (serverProcess) {
        serverProcess.kill();
      }
      process.exit(1);
    }
    console.log('✅ Server booted successfully on port 4000.');
  }

  const scripts = [
    path.join(__dirname, './test-auth.ts'),
    path.join(__dirname, './test-applications.ts'),
    path.join(__dirname, './test-documents.ts'),
    path.join(__dirname, './test-admin-apis.ts'),
  ];

  const results: Record<string, string> = {};
  let overallSuccess = true;

  for (const script of scripts) {
    const name = path.basename(script);
    const code = await runScript(script);
    if (code === 0) {
      results[name] = 'PASSED ✅';
    } else {
      results[name] = 'FAILED ❌';
      overallSuccess = false;
    }
  }

  // Teardown spawned server
  if (serverProcess) {
    console.log('\n🛑 Shutting down spawned background server process...');
    serverProcess.kill('SIGINT');
  }

  console.log('\n==================================================');
  console.log('📊 MASTER INTEGRATION TEST REPORT');
  console.log('==================================================');
  for (const [name, status] of Object.entries(results)) {
    console.log(`- ${name}: ${status}`);
  }
  console.log('==================================================');

  if (overallSuccess) {
    console.log('✨ All integration tests completed successfully! 🎉');
    process.exit(0);
  } else {
    console.error('❌ Some integration tests failed. Please review logs above.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled error in master test runner:', err);
  process.exit(1);
});
