import { readFileSync, writeFileSync } from "node:fs";
import { deflateRawSync, inflateRawSync } from "node:zlib";

const crcTable = new Uint32Array(256);
for (let value = 0; value < 256; value += 1) {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  crcTable[value] = crc >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTimestamp(date = new Date()) {
  const year = Math.max(1980, date.getUTCFullYear());
  const time =
    (date.getUTCHours() << 11) |
    (date.getUTCMinutes() << 5) |
    Math.floor(date.getUTCSeconds() / 2);
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  return { date: dosDate, time };
}

export function writeZip(entries, outputPath) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const stamp = dosTimestamp();

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const source = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, "utf8");
    const compressed = deflateRawSync(source);
    const checksum = crc32(source);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(stamp.time, 10);
    local.writeUInt16LE(stamp.date, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(source.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(stamp.time, 12);
    central.writeUInt16LE(stamp.date, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(source.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  writeFileSync(outputPath, Buffer.concat([...localParts, centralDirectory, end]));
}

function findEndOfCentralDirectory(buffer) {
  const minimum = Math.max(0, buffer.length - 65557);
  for (let index = buffer.length - 22; index >= minimum; index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) return index;
  }
  throw new Error("Invalid XLSX: ZIP end-of-central-directory record not found.");
}

export function readZip(inputPath) {
  const archive = readFileSync(inputPath);
  const end = findEndOfCentralDirectory(archive);
  const entryCount = archive.readUInt16LE(end + 10);
  let cursor = archive.readUInt32LE(end + 16);
  const files = new Map();

  for (let index = 0; index < entryCount; index += 1) {
    if (archive.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error("Invalid XLSX: malformed ZIP central directory.");
    }
    const method = archive.readUInt16LE(cursor + 10);
    const compressedSize = archive.readUInt32LE(cursor + 20);
    const nameLength = archive.readUInt16LE(cursor + 28);
    const extraLength = archive.readUInt16LE(cursor + 30);
    const commentLength = archive.readUInt16LE(cursor + 32);
    const localOffset = archive.readUInt32LE(cursor + 42);
    const name = archive.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    if (archive.readUInt32LE(localOffset) !== 0x04034b50) {
      throw new Error(`Invalid XLSX: malformed ZIP entry ${name}.`);
    }
    const localNameLength = archive.readUInt16LE(localOffset + 26);
    const localExtraLength = archive.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = archive.subarray(dataStart, dataStart + compressedSize);
    let data;
    if (method === 0) data = compressed;
    else if (method === 8) data = inflateRawSync(compressed);
    else throw new Error(`Invalid XLSX: unsupported ZIP compression method ${method}.`);
    files.set(name, data);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

export function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function decodeXml(value) {
  return String(value ?? "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

export function columnName(index) {
  let value = index + 1;
  let name = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

export function columnIndex(reference) {
  const letters = String(reference).match(/^[A-Z]+/i)?.[0]?.toUpperCase();
  if (!letters) throw new Error(`Invalid cell reference: ${reference}`);
  let result = 0;
  for (const letter of letters) result = result * 26 + letter.charCodeAt(0) - 64;
  return result - 1;
}

function cellXml(cell, rowIndex, columnIndexValue) {
  const reference = `${columnName(columnIndexValue)}${rowIndex + 1}`;
  const style = Number.isInteger(cell?.style) ? ` s="${cell.style}"` : "";
  if (cell?.formula) {
    return `<c r="${reference}"${style}><f>${escapeXml(cell.formula)}</f><v>${escapeXml(cell.value ?? 0)}</v></c>`;
  }
  if (cell?.type === "number" && cell.value !== "" && cell.value !== null && cell.value !== undefined) {
    return `<c r="${reference}"${style}><v>${Number(cell.value)}</v></c>`;
  }
  const value = String(cell?.value ?? "");
  const preserve = /^\s|\s$|\n/.test(value) ? ' xml:space="preserve"' : "";
  return `<c r="${reference}" t="inlineStr"${style}><is><t${preserve}>${escapeXml(value)}</t></is></c>`;
}

export function worksheetXml({
  rows,
  widths = [],
  freeze = { rows: 1, columns: 0 },
  autoFilter,
  dataValidations = [],
  conditionalFormatting = [],
}) {
  const maxColumns = Math.max(1, ...rows.map((row) => row.length));
  const maxRows = Math.max(1, rows.length);
  const dimension = `A1:${columnName(maxColumns - 1)}${maxRows}`;
  const columns = widths.length
    ? `<cols>${widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("")}</cols>`
    : "";
  const pane = freeze.rows || freeze.columns
    ? `<sheetViews><sheetView workbookViewId="0"><pane${freeze.columns ? ` xSplit="${freeze.columns}"` : ""}${freeze.rows ? ` ySplit="${freeze.rows}"` : ""} topLeftCell="${columnName(freeze.columns)}${freeze.rows + 1}" activePane="bottomRight" state="frozen"/></sheetView></sheetViews>`
    : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
  const sheetData = rows
    .map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((cell, columnIndexValue) => cellXml(cell, rowIndex, columnIndexValue)).join("")}</row>`)
    .join("");
  const validations = dataValidations.length
    ? `<dataValidations count="${dataValidations.length}">${dataValidations.map((item) => `<dataValidation type="${item.type}" allowBlank="${item.allowBlank === false ? 0 : 1}" showErrorMessage="1" errorTitle="Invalid value" error="${escapeXml(item.error)}" sqref="${item.range}">${item.formula1 ? `<formula1>${escapeXml(item.formula1)}</formula1>` : ""}${item.formula2 ? `<formula2>${escapeXml(item.formula2)}</formula2>` : ""}</dataValidation>`).join("")}</dataValidations>`
    : "";
  const conditions = conditionalFormatting
    .map((item) => `<conditionalFormatting sqref="${item.range}"><cfRule type="expression" dxfId="${item.dxfId}" priority="${item.priority}"><formula>${escapeXml(item.formula)}</formula></cfRule></conditionalFormatting>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="${dimension}"/>${pane}<sheetFormatPr defaultRowHeight="18"/>${columns}<sheetData>${sheetData}</sheetData>${autoFilter ? `<autoFilter ref="${autoFilter}"/>` : ""}${conditions}${validations}<pageMargins left="0.4" right="0.4" top="0.6" bottom="0.6" header="0.2" footer="0.2"/></worksheet>`;
}

export function parseWorksheet(xml, sharedStrings = []) {
  const rows = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const rowIndex = Number(rowMatch[1]) - 1;
    const row = [];
    for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attributes = cellMatch[1];
      const body = cellMatch[2];
      const reference = attributes.match(/\br="([A-Z]+\d+)"/)?.[1];
      if (!reference) continue;
      const type = attributes.match(/\bt="([^"]+)"/)?.[1];
      let value = "";
      if (type === "inlineStr") {
        value = [...body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((match) => decodeXml(match[1])).join("");
      } else {
        const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "";
        value = type === "s" ? (sharedStrings[Number(raw)] ?? "") : decodeXml(raw);
      }
      row[columnIndex(reference)] = value;
    }
    rows[rowIndex] = row;
  }
  return rows;
}

export function sharedStringsFromXml(xml = "") {
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) =>
    [...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
      .map((textMatch) => decodeXml(textMatch[1]))
      .join(""),
  );
}
