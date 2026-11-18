import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  USB_HARDWARE_SIGNATURES,
  DIODE_REFERENCE_RAILS,
  DEVICE_MODELS_ATLAS,
  IC_FAULT_CATALOG,
  identifyUsbDevice,
  evaluateDiodeReading,
  searchDeviceAtlas,
} from '../src/data/hardwareAtlas';
import {
  BOARD_SCHEMATICS,
  listSchematicsSummary,
  getSchematicDetail,
  getSchematicForDevice,
} from '../src/services/schematicsEngine';
import { analyzeDcPowerDraw } from '../src/services/powerAnalyzer';
import { FAULT_REPAIRS } from '../src/data/faultRepairs';
import { HARDWARE_REPAIR_GUIDES } from '../src/data/hardwareRepairGuides';
import {
  OPEN_SOURCE_REPAIR_TOOLS,
  PHONE_CIRCUIT_SUBSYSTEMS,
  SOC_PROCESSOR_DATABASE,
  REPAIR_JUMPER_GUIDES,
  OPEN_SOURCE_AUTOMATION_SNIPPETS,
} from '../src/data/openSourceHardwareCatalog';
import type { ConnectedDevice, HardwareCategory } from '../src/types';

const BASE_URL = process.env.WORKSTATION_BASE_URL || 'http://127.0.0.1:3000';

function makeDevice(overrides: Partial<ConnectedDevice>): ConnectedDevice {
  return {
    id: 'test-dev',
    brand: 'Samsung',
    model: 'SM-S928B',
    marketName: overrides.model || 'Test Smartphone',
    chipset: 'qualcomm',
    chipsetName: overrides.chipsetName || 'Generic SoC',
    socId: overrides.socId || 'GENERIC',
    mode: 'ADB_ONLINE',
    port: 'ADB:TEST',
    vidPid: '04E8:6860',
    serialNumber: 'R58T123456A',
    imei1: '350000000000001',
    imei2: '350000000000002',
    basebandVersion: 'S928BXXU1',
    androidVersion: '14',
    securityPatch: '2025-01-01',
    buildNumber: 'UP1A.231005.007',
    bootloaderStatus: 'LOCKED',
    frpStatus: 'OFF',
    storageType: 'UFS 4.0',
    storageSizeGb: 256,
    batteryLevel: 85,
    rollbackIndex: 1,
    ...overrides,
  };
}

function testHardwareAtlas() {
  assert.equal(USB_HARDWARE_SIGNATURES.length, 14, 'Expected 14 USB VID:PID signatures');
  for (const sig of USB_HARDWARE_SIGNATURES) {
    const direct = identifyUsbDevice(sig.vid, sig.pid);
    assert.equal(direct.matched, true, `Should match ${sig.vid}:${sig.pid}`);
    assert.equal(direct.mode, sig.mode);

    const prefixed = identifyUsbDevice(`0x${sig.vid.toLowerCase()}`, `0x${sig.pid.toLowerCase()}`);
    assert.equal(prefixed.matched, true, `Should match lowercase 0x prefix for ${sig.vid}:${sig.pid}`);
  }
  const unknownUsb = identifyUsbDevice('FFFF', '9999');
  assert.equal(unknownUsb.matched, false);

  assert.equal(DIODE_REFERENCE_RAILS.length, 13, 'Expected 13 Diode Reference Rails');
  for (const rail of DIODE_REFERENCE_RAILS) {
    const midV = Number(((rail.min_v + rail.max_v) / 2).toFixed(3));
    const healthy = evaluateDiodeReading(rail.rail_code, midV);
    assert.equal(healthy.status, 'HEALTHY', `Expected HEALTHY for ${rail.rail_code} at ${midV}V`);

    const shortV = Math.max(0.001, Number((rail.short_threshold * 0.5).toFixed(3)));
    const shorted = evaluateDiodeReading(rail.rail_code, shortV);
    assert.equal(shorted.status, 'SHORT_CIRCUIT', `Expected SHORT_CIRCUIT for ${rail.rail_code} at ${shortV}V`);

    const leakV = Number(((rail.short_threshold + rail.min_v) / 2).toFixed(3));
    if (leakV > rail.short_threshold && leakV < rail.min_v) {
      const leak = evaluateDiodeReading(rail.rail_code, leakV);
      assert.equal(leak.status, 'LEAKAGE_LOW', `Expected LEAKAGE_LOW for ${rail.rail_code} at ${leakV}V`);
    }

    const open = evaluateDiodeReading(rail.rail_code, 1.85);
    assert.equal(open.status, 'OPEN_LINE', `Expected OPEN_LINE for ${rail.rail_code} at 1.85V`);
  }

  assert.equal(evaluateDiodeReading('CUSTOM_UNKNOWN_RAIL', 0.01).status, 'SHORT_CIRCUIT');
  assert.equal(evaluateDiodeReading('CUSTOM_UNKNOWN_RAIL', 2.2).status, 'OPEN_LINE');
  assert.equal(evaluateDiodeReading('CUSTOM_UNKNOWN_RAIL', 0.45).status, 'NORMAL_RANGE');

  assert.equal(DEVICE_MODELS_ATLAS.length, 24, 'Expected 24 curated real-world smartphone entries');
  assert.equal(IC_FAULT_CATALOG.length, 9, 'Expected 9 curated IC fault catalog entries');
  assert.ok(searchDeviceAtlas('', 'Apple').length >= 4, 'Expected >= 4 Apple models');
  assert.ok(searchDeviceAtlas('Kirin', '').length >= 1, 'Expected Kirin search hit');
  assert.ok(searchDeviceAtlas('Unisoc', '').length >= 2, 'Expected Unisoc search hits');
  console.log('✓ HardwareAtlas pure checks passed (14 USB, 13 Diode Rails, 24 Devices, 9 ICs)');
}

function testPowerAnalyzer() {
  const s1 = analyzeDcPowerDraw('apple', 650, 650, 'stuck');
  assert.equal(s1.stage, 'PRE_BOOT_DEAD_SHORT');

  const s2 = analyzeDcPowerDraw('apple', 45, 45, 'stuck');
  assert.equal(s2.stage, 'PRE_BOOT_LEAKAGE');

  const s3 = analyzeDcPowerDraw('qualcomm', 0, 0, 'zero');
  assert.equal(s3.stage, 'NO_POWER_KEY_RESPONSE');

  const s4 = analyzeDcPowerDraw('mediatek', 0, 55, 'drops_to_zero');
  assert.equal(s4.stage, 'PMIC_WAKE_FAIL');

  const s5 = analyzeDcPowerDraw('qualcomm', 0, 145, 'stuck');
  assert.equal(s5.stage, 'CPU_RAM_HANDSHAKE_STUCK');

  const s6 = analyzeDcPowerDraw('apple', 0, 520, 'cycling');
  assert.equal(s6.stage, 'BOOT_OS_STAGE');
  assert.equal(s6.severity, 'medium');

  console.log('✓ PowerAnalyzer pure checks passed across all 6 fault stages');
}

function testSchematicsEngine() {
  const summary = listSchematicsSummary();
  assert.equal(summary.length, 12, 'Expected 12 complete BoardViews in BOARD_SCHEMATICS');
  for (const item of summary) {
    const detail = getSchematicDetail(item.id);
    assert.ok(detail, `Missing schematic detail for ${item.id}`);
    assert.ok(detail.components.length >= 4, `Expected >=4 components in ${item.id}`);
    assert.ok(detail.pins.length >= 4, `Expected >=4 pins in ${item.id}`);
    assert.ok(detail.power_sequence.length >= 3, `Expected >=3 power sequence steps in ${item.id}`);
  }

  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Apple', chipset: 'apple_ios', model: 'iPhone 15 Pro Max' })).id,
    'iphone_15_pro_max_a17'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Apple', chipset: 'apple_ios', model: 'iPhone 14 Pro' })).id,
    'iphone_14_pro_board'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Samsung', chipset: 'qualcomm', model: 'SM-S928B', marketName: 'Galaxy S24 Ultra' })).id,
    'samsung_s24_ultra_sm8650'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Samsung', chipset: 'samsung_exynos', model: 'SM-A546B', marketName: 'Galaxy A54 5G', socId: 'Exynos 1380' })).id,
    'samsung_exynos_a54_board'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Google', chipset: 'google_tensor', model: 'Pixel 8 Pro' })).id,
    'google_pixel_tensor_g3'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Realme', chipset: 'unisoc_spd', model: 'RMX3760' })).id,
    'unisoc_tiger_board'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Huawei', chipset: 'hisilicon_kirin', model: 'VOG-L29' })).id,
    'huawei_kirin_board'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Xiaomi', chipset: 'qualcomm', model: 'Xiaomi 14 Pro', marketName: 'Xiaomi 14 Pro' })).id,
    'xiaomi_14_hyperos_qcom'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'OPPO', chipset: 'mediatek', chipsetName: 'Dimensity 8200', model: 'CPH2451' })).id,
    'oppo_realme_dimensity_board'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Infinix', chipset: 'mediatek', chipsetName: 'Helio G99', model: 'X6850' })).id,
    'infinix_tecno_helio_board'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Xiaomi', chipset: 'qualcomm', model: 'POCO F5' })).id,
    'xiaomi_qualcomm_mtk_board'
  );
  assert.equal(
    getSchematicForDevice(makeDevice({ brand: 'Samsung', chipset: 'mediatek', model: 'SM-A325F' })).id,
    'samsung_a325f_board'
  );

  console.log('✓ SchematicsEngine pure checks passed across all 12 boards & SoC routers');
}

function testOpenSourceCatalog() {
  assert.ok(OPEN_SOURCE_REPAIR_TOOLS.length >= 12, `Expected >=12 open-source tools, got ${OPEN_SOURCE_REPAIR_TOOLS.length}`);
  assert.ok(PHONE_CIRCUIT_SUBSYSTEMS.length >= 10, `Expected >=10 circuit subsystems, got ${PHONE_CIRCUIT_SUBSYSTEMS.length}`);
  assert.ok(SOC_PROCESSOR_DATABASE.length >= 9, `Expected >=9 SoC families, got ${SOC_PROCESSOR_DATABASE.length}`);
  assert.ok(REPAIR_JUMPER_GUIDES.length >= 3, `Expected >=3 repair jumper guides, got ${REPAIR_JUMPER_GUIDES.length}`);
  assert.ok(OPEN_SOURCE_AUTOMATION_SNIPPETS.length >= 3, `Expected >=3 automation snippets, got ${OPEN_SOURCE_AUTOMATION_SNIPPETS.length}`);

  for (const tool of OPEN_SOURCE_REPAIR_TOOLS) {
    assert.ok(tool.sampleCommands.length >= 1, `Tool ${tool.id} needs sampleCommands`);
    assert.ok(tool.repository.includes('/'), `Tool ${tool.id} needs valid repo path`);
  }
  for (const circ of PHONE_CIRCUIT_SUBSYSTEMS) {
    assert.ok(circ.primaryNets.length >= 2, `Circuit ${circ.id} needs >=2 primaryNets`);
    assert.ok(circ.diagnosticProcedureAr.length >= 2, `Circuit ${circ.id} needs diagnosticProcedureAr`);
  }
  for (const soc of SOC_PROCESSOR_DATABASE) {
    assert.ok(soc.pairedPmics.length >= 1, `SoC ${soc.id} needs pairedPmics`);
    assert.ok(soc.socPartNumbers.length >= 1, `SoC ${soc.id} needs socPartNumbers`);
  }
  for (const jmp of REPAIR_JUMPER_GUIDES) {
    assert.ok(jmp.jumperSourceNet && jmp.jumperTargetNet, `Jumper ${jmp.id} needs net sources`);
  }
  for (const snip of OPEN_SOURCE_AUTOMATION_SNIPPETS) {
    assert.ok(snip.codeSnippet.length >= 10, `Snippet ${snip.id} needs codeSnippet`);
  }

  console.log(
    `✓ OpenSourceHardwareCatalog checks passed (${OPEN_SOURCE_REPAIR_TOOLS.length} tools, ${PHONE_CIRCUIT_SUBSYSTEMS.length} circuits, ${SOC_PROCESSOR_DATABASE.length} SoCs, ${REPAIR_JUMPER_GUIDES.length} jumpers, ${OPEN_SOURCE_AUTOMATION_SNIPPETS.length} snippets)`
  );
}

function testFaultsAndGuidesIntegrity() {
  assert.ok(FAULT_REPAIRS.length >= 25, `Expected >=25 FAULT_REPAIRS, got ${FAULT_REPAIRS.length}`);
  const faultIds = new Set<string>();
  for (const fault of FAULT_REPAIRS) {
    assert.ok(!faultIds.has(fault.id), `Duplicate FAULT_REPAIRS id: ${fault.id}`);
    faultIds.add(fault.id);
    assert.ok(fault.protocolPipeline.length >= 3, `Fault ${fault.id} must have >=3 protocol steps`);
  }

  const requiredCategories: HardwareCategory[] = [
    'POWER_PMIC',
    'CHARGING_VBUS',
    'DISPLAY_BACKLIGHT',
    'BASEBAND_RF',
    'AUDIO_CODEC',
    'UFS_RAM_CPU',
    'SHORT_CIRCUIT',
  ];
  const guideIds = new Set<string>();
  const coveredCats = new Set<HardwareCategory>();
  for (const guide of HARDWARE_REPAIR_GUIDES) {
    assert.ok(!guideIds.has(guide.id), `Duplicate HARDWARE_REPAIR_GUIDES id: ${guide.id}`);
    guideIds.add(guide.id);
    coveredCats.add(guide.category);
    assert.ok(guide.testPoints.length >= 1, `Guide ${guide.id} needs >=1 testPoint`);
    assert.ok(guide.boardChips.length >= 1, `Guide ${guide.id} needs >=1 boardChip`);
    assert.ok(guide.microSolderingSteps.length >= 1, `Guide ${guide.id} needs >=1 step`);
  }
  for (const cat of requiredCategories) {
    assert.ok(coveredCats.has(cat), `Missing HardwareCategory coverage in HARDWARE_REPAIR_GUIDES: ${cat}`);
  }

  console.log(
    `✓ Faults & Micro-Soldering integrity passed (${FAULT_REPAIRS.length} faults, ${HARDWARE_REPAIR_GUIDES.length} guides across all 7 hardware categories)`
  );
}

function testNavbarToolCanvasParity() {
  const navbarSrc = fs.readFileSync(path.resolve('src/components/Navbar.tsx'), 'utf8');
  const canvasSrc = fs.readFileSync(path.resolve('src/components/layout/ToolCanvas.tsx'), 'utf8');

  assert.equal(/[\u0590-\u05FF]/.test(navbarSrc), false, 'Navbar.tsx must not contain stray Hebrew characters');

  const navSectionMatch = navbarSrc.match(/const navTabs = \[([\s\S]*?)\n  \];/);
  assert.ok(navSectionMatch, 'Could not locate navTabs array in Navbar.tsx');

  const navIds = Array.from(navSectionMatch[1].matchAll(/\{\s*id:\s*'([^']+)'/g)).map((m) => m[1]);
  assert.ok(navIds.length >= 50, `Expected >=50 navTabs, got ${navIds.length}`);

  const canvasCases = new Set(Array.from(canvasSrc.matchAll(/case\s+'([^']+)':/g)).map((m) => m[1]));
  const missingInCanvas = navIds.filter((id) => !canvasCases.has(id));
  assert.deepEqual(missingInCanvas, [], `Nav tabs missing in ToolCanvas switch: ${missingInCanvas.join(', ')}`);

  assert.ok(canvasCases.has('mtk-pro-tool') && navIds.includes('mtk-pro-tool'), 'mtk-pro-tool must be in both Navbar and ToolCanvas');
  assert.ok(
    canvasCases.has('next-gen-workspace') && navIds.includes('next-gen-workspace'),
    'next-gen-workspace must be in both Navbar and ToolCanvas'
  );

  console.log(`✓ Navbar <-> ToolCanvas parity passed (${navIds.length} nav routes, 0 orphans, 0 script typos)`);
}

function testUiHygieneAndRoutingParity() {
  const srcRoot = path.resolve('src');
  const collectFiles = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...collectFiles(full));
      else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
    return out;
  };

  for (const file of collectFiles(srcRoot)) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(process.cwd(), file);
    assert.equal(/\bwindow\.open\s*\(/.test(content), false, `Forbidden window.open found in ${rel}`);
    assert.equal(/\bwindow\.alert\s*\(/.test(content), false, `Forbidden window.alert found in ${rel}`);
    assert.equal(/unsplash\.com/.test(content), false, `Forbidden unsplash.com placeholder URL found in ${rel}`);
  }

  const canvasSrc = fs.readFileSync(path.resolve('src/components/layout/ToolCanvas.tsx'), 'utf8');
  const canvasCases = new Set(Array.from(canvasSrc.matchAll(/case\s+'([^']+)':/g)).map((m) => m[1]));

  const dashboardSrc = fs.readFileSync(path.resolve('src/components/CentralDashboard.tsx'), 'utf8');
  const toolsBlockMatch = dashboardSrc.match(/const allTools:\s*ToolDefinition\[\]\s*=\s*useMemo\(\(\)\s*=>\s*\[([\s\S]*?)\n  \], \[\]\);/);
  assert.ok(toolsBlockMatch, 'Could not locate allTools in CentralDashboard.tsx');
  const dashboardToolIds = Array.from(toolsBlockMatch[1].matchAll(/\n\s{4}\{\n\s{6}id:\s*'([^']+)'/g)).map((m) => m[1]);
  assert.ok(dashboardToolIds.length >= 40, `Expected >=40 dashboard tools, got ${dashboardToolIds.length}`);
  const missingDashboardTools = dashboardToolIds.filter((id) => !canvasCases.has(id));
  assert.deepEqual(missingDashboardTools, [], `Dashboard tools missing in ToolCanvas: ${missingDashboardTools.join(', ')}`);

  const actionTabs = Array.from(dashboardSrc.matchAll(/actionTab:\s*'([^']+)'/g)).map((m) => m[1]);
  const missingActionTabs = actionTabs.filter((id) => !canvasCases.has(id));
  assert.deepEqual(missingActionTabs, [], `Dashboard actionTabs missing in ToolCanvas: ${missingActionTabs.join(', ')}`);

  const railSrc = fs.readFileSync(path.resolve('src/components/layout/NavigationRail.tsx'), 'utf8');
  const railTabs = Array.from(railSrc.matchAll(/targetTab:\s*'([^']+)'/g)).map((m) => m[1]);
  const missingRailTabs = railTabs.filter((id) => !canvasCases.has(id));
  assert.deepEqual(missingRailTabs, [], `NavigationRail targetTabs missing in ToolCanvas: ${missingRailTabs.join(', ')}`);

  const paletteSrc = fs.readFileSync(path.resolve('src/components/CommandPaletteModal.tsx'), 'utf8');
  const paletteTabs = Array.from(paletteSrc.matchAll(/tabId:\s*'([^']+)'/g)).map((m) => m[1]);
  assert.ok(paletteTabs.length >= 20, `Expected >=20 CommandPalette routes, got ${paletteTabs.length}`);
  const missingPaletteTabs = paletteTabs.filter((id) => !canvasCases.has(id));
  assert.deepEqual(missingPaletteTabs, [], `CommandPaletteModal tabIds missing in ToolCanvas: ${missingPaletteTabs.join(', ')}`);

  const deterministicFiles = [
    'src/utils/reportExporter.ts',
    'src/services/realUsbService.ts',
    'src/services/samsungNetworkEngine.ts',
    'src/services/eventDrivenPipelineEngine.ts',
    'src/components/UsbConnectionModal.tsx',
    'src/components/CentralDashboard.tsx',
    'src/components/layout/LiveUsbDetectionBanner.tsx',
    'src/components/UltimateFaultRepairHub.tsx',
    'src/components/SamsungOdinFlasherStudio.tsx',
  ];
  for (const relPath of deterministicFiles) {
    const src = fs.readFileSync(path.resolve(relPath), 'utf8');
    assert.equal(/\bMath\.random\s*\(/.test(src), false, `Forbidden Math.random() in deterministic file ${relPath}`);
  }

  const fwSrc = fs.readFileSync(path.resolve('src/data/firmwareCatalog.ts'), 'utf8');
  const shaHashes = Array.from(fwSrc.matchAll(/sha256Checksum:\s*'([^']+)'/g)).map((m) => m[1]);
  assert.ok(shaHashes.length >= 13, `Expected >=13 OEM firmware entries, got ${shaHashes.length}`);
  for (const h of shaHashes) {
    assert.match(h, /^[a-f0-9]{64}$/i, `Invalid SHA-256 format in firmwareCatalog: ${h}`);
  }

  console.log(`✓ Static UI hygiene & routing parity passed (${dashboardToolIds.length} dashboard, ${railTabs.length} rail, ${paletteTabs.length} palette routes, ${shaHashes.length} SHA-256 firmwares)`);
}

async function waitForServer(maxWaitMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server at ${BASE_URL} did not become ready within ${maxWaitMs}ms`);
}

async function fetchJson(urlPath: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function testLiveHttpApi() {
  await waitForServer();

  const storePath = path.resolve('data/cases_store.json');
  const hadStore = fs.existsSync(storePath);
  const previousStore = hadStore ? fs.readFileSync(storePath, 'utf8') : null;

  try {
    const health = await fetchJson('/api/health');
    assert.equal(health.status, 200);
    assert.equal(health.data.status, 'online');

    const sysCheck = await fetchJson('/api/system/check');
    assert.equal(sysCheck.status, 200);
    assert.equal(sysCheck.data.success, true);

    const devicesCatalog = await fetchJson('/api/devices');
    assert.equal(devicesCatalog.status, 200);
    assert.equal(devicesCatalog.data.success, true);
    assert.ok(Array.isArray(devicesCatalog.data.manufacturers) && devicesCatalog.data.manufacturers.length > 0);

    const usbBadTool = await fetchJson('/api/usb/execute', {
      method: 'POST',
      body: JSON.stringify({ toolName: 'rm', args: ['-rf'] }),
    });
    assert.equal(usbBadTool.status, 400);

    const usbFastboot = await fetchJson('/api/usb/execute', {
      method: 'POST',
      body: JSON.stringify({ toolName: 'fastboot', args: ['devices'] }),
    });
    assert.equal(usbFastboot.status, 200);
    assert.equal(typeof usbFastboot.data.success, 'boolean');
    assert.equal(typeof usbFastboot.data.output, 'string');

    const catalogs = await fetchJson('/api/catalogs');
    assert.equal(catalogs.status, 200);
    assert.equal(catalogs.data.success, true);
    assert.equal(catalogs.data.usb_signatures.length, 14);
    assert.equal(catalogs.data.diode_rails.length, 13);
    assert.equal(catalogs.data.ic_faults.length, 9);

    const atlas = await fetchJson('/api/atlas/devices');
    assert.equal(atlas.status, 200);
    assert.equal(atlas.data.devices.length, 24);

    const atlasApple = await fetchJson('/api/atlas/devices?brand=Apple');
    assert.equal(atlasApple.status, 200);
    assert.ok(atlasApple.data.devices.length >= 4);

    const schematics = await fetchJson('/api/schematics');
    assert.equal(schematics.status, 200);
    assert.equal(schematics.data.schematics.length, 12);

    const oss = await fetchJson('/api/opensource-resources');
    assert.equal(oss.status, 200);
    assert.equal(oss.data.success, true);
    assert.ok(oss.data.open_source_tools.length >= 12);
    assert.ok(oss.data.circuit_subsystems.length >= 10);
    assert.ok(oss.data.soc_processors.length >= 9);
    assert.ok(oss.data.jumper_guides.length >= 3);
    assert.ok(oss.data.automation_snippets.length >= 3);

    const schematicOne = await fetchJson('/api/schematics/unisoc_tiger_board');
    assert.equal(schematicOne.status, 200);
    assert.equal(schematicOne.data.schematic.id, 'unisoc_tiger_board');

    const schematicMissing = await fetchJson('/api/schematics/nonexistent_board');
    assert.equal(schematicMissing.status, 404);

    const scanUsb = await fetchJson('/api/hardware/scan-usb');
    assert.equal(scanUsb.status, 200);
    assert.equal(scanUsb.data.success, true);
    assert.equal(scanUsb.data.known_signatures, 14);
    assert.ok(Array.isArray(scanUsb.data.ports));

    const badDiode = await fetchJson('/api/hardware/diode-check', {
      method: 'POST',
      body: JSON.stringify({ rail_code: 'PP_VDD_MAIN / VPH_PWR' }),
    });
    assert.equal(badDiode.status, 400);

    const shortDiode = await fetchJson('/api/hardware/diode-check', {
      method: 'POST',
      body: JSON.stringify({ rail_code: 'PP_VDD_MAIN / VPH_PWR', measured_v: 0.012 }),
    });
    assert.equal(shortDiode.status, 200);
    assert.equal(shortDiode.data.evaluation.status, 'SHORT_CIRCUIT');

    const pwrAnalyze = await fetchJson('/api/power/analyze', {
      method: 'POST',
      body: JSON.stringify({ architecture: 'qualcomm', pre_boot_ma: 0, post_boot_ma: 145, boot_behavior: 'stuck' }),
    });
    assert.equal(pwrAnalyze.status, 200);
    assert.equal(pwrAnalyze.data.analysis.stage, 'CPU_RAM_HANDSHAKE_STUCK');

    const createdCase = await fetchJson('/api/cases', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'اختبار آلي للمختبر',
        customer_phone: '+201000000000',
        device_model: 'Samsung Galaxy A54 5G (SM-A546B)',
        reported_issue: 'توقف عن الشحن مع رسالة رطوبة USB',
        estimated_cost: 650,
      }),
    });
    assert.equal(createdCase.status, 200);
    const caseId = createdCase.data.id;
    const caseToken = createdCase.data.case_token;
    assert.ok(caseId && caseToken);

    const updatedCase = await fetchJson(`/api/cases/${caseId}`, {
      method: 'PATCH',
      body: JSON.stringify({ workflow_stage: 'diagnosing', estimated_cost: 700 }),
    });
    assert.equal(updatedCase.status, 200);
    assert.equal(updatedCase.data.case.workflow_stage, 'diagnosing');

    const diodeAttach = await fetchJson('/api/hardware/diode-check', {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, rail_code: 'USB_CC1 / USB_CC2', measured_v: 0.015 }),
    });
    assert.equal(diodeAttach.status, 200);

    const aiDiag = await fetchJson(`/api/cases/${caseId}/ai-diagnose`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    assert.equal(aiDiag.status, 200);
    assert.equal(aiDiag.data.success, true);
    assert.ok(aiDiag.data.diagnosis.final_diagnosis_ar.length > 10);

    const portal = await fetchJson(`/api/public/portal/${caseToken}`);
    assert.equal(portal.status, 200);
    assert.equal(portal.data.portal.device_model, 'Samsung Galaxy A54 5G (SM-A546B)');

    console.log(`✓ Live Express API end-to-end checks passed against ${BASE_URL} (case #${caseId})`);
  } finally {
    if (hadStore && previousStore !== null) {
      fs.writeFileSync(storePath, previousStore, 'utf8');
    } else if (!hadStore && fs.existsSync(storePath)) {
      fs.unlinkSync(storePath);
    }
  }
}

async function main() {
  testHardwareAtlas();
  testPowerAnalyzer();
  testSchematicsEngine();
  testOpenSourceCatalog();
  testFaultsAndGuidesIntegrity();
  testNavbarToolCanvasParity();
  testUiHygieneAndRoutingParity();
  await testLiveHttpApi();
  console.log('\nALL WORKSTATION VERIFICATION SUITES PASSED SUCCESSFULLY.');
}

main().catch((err) => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});
