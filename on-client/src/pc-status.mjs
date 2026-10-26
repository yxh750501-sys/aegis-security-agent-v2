import os from 'node:os';
import {statfs} from 'node:fs/promises';
import {parse} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

const gib = bytes => Math.round(bytes / 1073741824 * 100) / 100;
const unavailable = reason => ({status: 'unavailable', reason, measuredAt: new Date().toISOString()});

function cpuTotals() {
  const cores = os.cpus();
  if (!cores.length) throw Error('CPU_UNAVAILABLE');
  return cores.reduce((sum, core) => {
    const times = core.times;
    sum.idle += times.idle;
    sum.total += times.user + times.nice + times.sys + times.idle + times.irq;
    return sum;
  }, {idle: 0, total: 0});
}

async function cpu() {
  try {
    const first = cpuTotals();
    await delay(250);
    const second = cpuTotals();
    const elapsed = second.total - first.total;
    if (elapsed <= 0) throw Error('CPU_UNAVAILABLE');
    const value = Math.round((1 - (second.idle - first.idle) / elapsed) * 1000) / 10;
    if (!Number.isFinite(value) || value < 0 || value > 100) throw Error('CPU_UNAVAILABLE');
    return {status: 'ok', value,
      unit: '%', measuredAt: new Date().toISOString()};
  } catch { return unavailable('CPU 사용률을 읽을 수 없습니다.'); }
}

function memory() {
  try {
    const total = os.totalmem();
    const free = os.freemem();
    if (!Number.isSafeInteger(total) || total <= 0 || free < 0 || free > total) throw Error('MEMORY_UNAVAILABLE');
    return {status: 'ok', value: gib(total - free), total: gib(total), unit: 'GiB',
      measuredAt: new Date().toISOString()};
  } catch { return unavailable('메모리 사용량을 읽을 수 없습니다.'); }
}

async function disk() {
  try {
    const root = parse(os.homedir()).root;
    if (!root) throw Error('DISK_UNAVAILABLE');
    const info = await statfs(root, {bigint: true});
    const free = Number(info.bavail * info.bsize);
    const total = Number(info.blocks * info.bsize);
    if (!Number.isSafeInteger(free) || !Number.isSafeInteger(total) || total <= 0 || free < 0 || free > total) throw Error('DISK_UNAVAILABLE');
    return {status: 'ok', value: gib(free), total: gib(total), unit: 'GiB', volume: root,
      measuredAt: new Date().toISOString()};
  } catch { return unavailable('디스크 남은 공간을 읽을 수 없습니다. 권한과 대상 드라이브를 확인하세요.'); }
}

export async function readPcStatus() {
  const [cpuResult, diskResult] = await Promise.all([cpu(), disk()]);
  return {source: 'local-app-server', cpu: cpuResult, memory: memory(), disk: diskResult};
}
