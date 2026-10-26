import os from 'node:os';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);
const unavailable = reason => ({status: 'unavailable', reason, checkedAt: new Date().toISOString()});

function network() {
  try {
    const interfaces = Object.entries(os.networkInterfaces()).flatMap(([name, addresses]) =>
      (addresses || []).filter(address => !address.internal && ['IPv4', 'IPv6'].includes(address.family))
        .map(address => ({name, family: address.family, address: address.address, cidr: address.cidr || '확인 불가'})));
    if (!interfaces.length) return unavailable('활성 네트워크 인터페이스의 주소를 읽을 수 없습니다.');
    return {status: 'ok', interfaces: interfaces.slice(0, 16), limited: interfaces.length > 16,
      checkedAt: new Date().toISOString()};
  } catch { return unavailable('네트워크 인터페이스 정보를 읽을 수 없습니다.'); }
}

async function powershell(script) {
  const encoded = Buffer.from(`[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()\n${script}`, 'utf16le').toString('base64');
  const {stdout} = await execFileAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded],
    {windowsHide: true, timeout: 12000, maxBuffer: 65536});
  return JSON.parse(stdout.replace(/^\uFEFF/, '').trim());
}

const firewallScript = `
$ErrorActionPreference = 'Stop'
try {
  $profiles = @(Get-NetFirewallProfile -ErrorAction Stop | ForEach-Object {
    @{ name = [string]$_.Name; enabled = [string]$_.Enabled;
       inbound = [string]$_.DefaultInboundAction; outbound = [string]$_.DefaultOutboundAction }
  })
  if ($profiles.Count -eq 0) { throw 'NO_PROFILES' }
  @{ status = 'ok'; profiles = $profiles } | ConvertTo-Json -Compress -Depth 5
} catch {
  $reason = if ($_.CategoryInfo.Category -eq 'PermissionDenied') { '방화벽 설정을 읽을 권한이 없습니다.' }
    else { '방화벽 프로필을 읽을 수 없습니다. Windows 방화벽 서비스를 확인하세요.' }
  @{ status = 'unavailable'; reason = $reason } | ConvertTo-Json -Compress
}`;

const eventsScript = `
$ErrorActionPreference = 'Stop'
$start = (Get-Date).AddHours(-24)
$logs = @{}
foreach ($name in @('System', 'Application')) {
  $warnings = 0; $errors = 0
  try {
    Get-WinEvent -FilterHashtable @{ LogName = $name; StartTime = $start; Level = 2,3 } -ErrorAction Stop |
      ForEach-Object { if ($_.Level -eq 2) { $errors++ } elseif ($_.Level -eq 3) { $warnings++ } }
    $logs[$name] = @{ status = 'ok'; warnings = $warnings; errors = $errors }
  } catch {
    if ($_.FullyQualifiedErrorId -like 'NoMatchingEventsFound*') {
      $logs[$name] = @{ status = 'ok'; warnings = 0; errors = 0 }
    } else {
      $reason = if ($_.CategoryInfo.Category -eq 'PermissionDenied') { '이 Windows 기록을 읽을 권한이 없습니다.' }
        else { '이 Windows 기록을 읽을 수 없습니다. 이벤트 로그 서비스를 확인하세요.' }
      $logs[$name] = @{ status = 'unavailable'; reason = $reason }
    }
  }
}
@{ System = $logs['System']; Application = $logs['Application']; windowStartAt = $start.ToUniversalTime().ToString('o') } |
  ConvertTo-Json -Compress -Depth 5`;

async function readFirewall() {
  try {
    const result = await powershell(firewallScript);
    if (result.status === 'unavailable' && typeof result.reason === 'string') return unavailable(result.reason);
    if (result.status !== 'ok' || !Array.isArray(result.profiles) || !result.profiles.length ||
      !result.profiles.every(p => typeof p.name === 'string' && typeof p.enabled === 'string' &&
        typeof p.inbound === 'string' && typeof p.outbound === 'string')) throw Error('INVALID_RESPONSE');
    return {status: 'ok', profiles: result.profiles, checkedAt: new Date().toISOString()};
  } catch { return unavailable('방화벽 설정을 읽을 수 없습니다. 권한 또는 PowerShell 실행 상태를 확인하세요.'); }
}

async function readEvents() {
  try {
    const result = await powershell(eventsScript);
    const valid = row => row && (row.status === 'unavailable' && typeof row.reason === 'string' ||
      row.status === 'ok' && Number.isSafeInteger(row.warnings) && row.warnings >= 0 &&
      Number.isSafeInteger(row.errors) && row.errors >= 0);
    if (!valid(result.System) || !valid(result.Application) || !Number.isFinite(Date.parse(result.windowStartAt)))
      throw Error('INVALID_RESPONSE');
    return {status: 'ok', windowStartAt: result.windowStartAt, checkedAt: new Date().toISOString(),
      System: result.System, Application: result.Application};
  } catch {
    return {status: 'ok', windowStartAt: null, checkedAt: new Date().toISOString(),
      System: unavailable('System 기록을 읽을 수 없습니다. 권한 또는 PowerShell 실행 상태를 확인하세요.'),
      Application: unavailable('Application 기록을 읽을 수 없습니다. 권한 또는 PowerShell 실행 상태를 확인하세요.')};
  }
}

export async function readLocalSecurityStatus() {
  const networkResult = network();
  if (process.platform !== 'win32') {
    const reason = 'Windows에서 실행한 앱 서버에서만 확인할 수 있습니다.';
    return {source: 'local-app-server', platform: process.platform, network: networkResult,
      firewall: unavailable(reason), events: {status: 'ok', windowStartAt: null,
        System: unavailable(reason), Application: unavailable(reason)}};
  }
  const [firewall, events] = await Promise.all([readFirewall(), readEvents()]);
  return {source: 'local-app-server', platform: process.platform, network: networkResult, firewall, events};
}
