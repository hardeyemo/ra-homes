"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Download, UploadCloud, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildCsvTemplate, IMPORT_COLUMNS } from "@/lib/importTemplate";

type Row = Record<string, string>;

interface RowValidation {
  row: Row;
  index: number;
  errors: string[];
}

const REQUIRED = ["title", "listingType", "propertyType", "price", "address", "city", "images"];
const ENUM_LISTING = ["SALE", "RENT"];
const ENUM_PROPERTY = ["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE", "LAND", "COMMERCIAL", "MULTI_FAMILY"];
const ENUM_STATUS = ["DRAFT", "ACTIVE", "PENDING", "SOLD", "RENTED", "ARCHIVED"];

function validateRow(row: Row): string[] {
  const errors: string[] = [];
  for (const field of REQUIRED) {
    if (!row[field] || String(row[field]).trim() === "") errors.push(`Missing ${field}`);
  }
  if (row.listingType && !ENUM_LISTING.includes(row.listingType.toUpperCase())) {
    errors.push(`listingType must be SALE or RENT`);
  }
  if (row.propertyType && !ENUM_PROPERTY.includes(row.propertyType.toUpperCase())) {
    errors.push(`propertyType must be one of ${ENUM_PROPERTY.join(", ")}`);
  }
  if (row.status && !ENUM_STATUS.includes(row.status.toUpperCase())) {
    errors.push(`status must be one of ${ENUM_STATUS.join(", ")}`);
  }
  if (row.price && isNaN(Number(row.price))) errors.push("price must be a number");
  return errors;
}

export default function ImportPage() {
  const [rows, setRows] = useState<RowValidation[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ createdCount: number; failed: { row: number; error: string }[] } | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResult(null);
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const parsed = res.data.map((row, index) => ({
          row,
          index,
          errors: validateRow(row),
        }));
        setRows(parsed);
      },
    });
  };

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await fetch("/api/properties/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows.map((r) => r.row) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult({ createdCount: data.createdCount, failed: data.failed || [] });
      setRows([]);
      setFileName(null);
    } catch (err) {
      setResult({ createdCount: 0, failed: [{ row: 0, error: (err as Error).message }] });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([buildCsvTemplate()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ra-homes-property-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-clay">Dashboard</p>
      <h1 className="mt-2 font-display text-4xl">Import Listings</h1>
      <p className="mt-3 text-ink/60 max-w-2xl">
        Upload a CSV of properties useful for RA's weekly batch of new listings. Preview and fix any
        validation errors before importing. New listings are created as <strong>Draft</strong> so you can
        review them before publishing. RA only.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" /> Download CSV Template
        </Button>
      </div>

      <label
        htmlFor="csv-upload"
        className="mt-6 flex flex-col items-center justify-center gap-2 border border-dashed border-line bg-surface h-36 cursor-pointer text-ink/50 hover:border-clay hover:text-clay transition-colors"
      >
        <UploadCloud className="w-6 h-6" />
        <span className="text-sm font-mono uppercase tracking-widest">
          {fileName ? fileName : "Click to upload a CSV file"}
        </span>
      </label>
      <input
        id="csv-upload"
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <p className="mt-3 text-xs text-ink/50">
        Required columns: {REQUIRED.join(", ")}. Use a <code>|</code> to separate multiple values in
        <code> images</code> and <code>amenities</code>. Full column list: {IMPORT_COLUMNS.join(", ")}.
      </p>

      {rows.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <p className="text-sm">
              <span className="text-sage-dark font-medium">{validRows.length} valid</span>
              {" · "}
              <span className="text-clay-dark font-medium">{invalidRows.length} with errors</span>
              {" · "}
              {rows.length} total rows
            </p>
            <Button onClick={handleImport} disabled={validRows.length === 0 || importing}>
              {importing ? "Importing..." : `Import ${validRows.length} Listings`}
            </Button>
          </div>

          <div className="border border-line bg-surface overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface">
                <tr className="text-left stat-strip border-b border-line">
                  <th className="p-3">#</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Errors</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.index} className={`border-b border-line last:border-0 ${r.errors.length > 0 ? "bg-clay/5" : ""}`}>
                    <td className="p-3">{r.index + 1}</td>
                    <td className="p-3">
                      {r.errors.length === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-clay-dark" />
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">{r.row.title || "—"}</td>
                    <td className="p-3 whitespace-nowrap">{r.row.propertyType} / {r.row.listingType}</td>
                    <td className="p-3 whitespace-nowrap">{r.row.price}</td>
                    <td className="p-3 whitespace-nowrap">{r.row.city}{r.row.neighborhood ? `, ${r.row.neighborhood}` : ""}</td>
                    <td className="p-3 text-clay-dark max-w-xs">{r.errors.join("; ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 border border-line bg-surface p-6">
          <p className="font-display text-lg">
            {result.createdCount > 0 ? `Imported ${result.createdCount} listings.` : "Import did not complete."}
          </p>
          {result.failed.length > 0 && (
            <ul className="mt-3 text-sm text-clay-dark space-y-1">
              {result.failed.map((f, i) => (
                <li key={i}>Row {f.row}: {f.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
