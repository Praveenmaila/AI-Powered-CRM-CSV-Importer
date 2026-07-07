"use client";

import { useCallback } from "react";
import {
  ArrowLeft,
  Download,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FileCheck2,
  FileX2,
} from "lucide-react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Stepper } from "@/components/layout/stepper";
import { Dropzone } from "@/components/upload/dropzone";
import { FileInfo } from "@/components/upload/file-info";
import { DataTable } from "@/components/preview/data-table";
import { StatsCards } from "@/components/results/stats-cards";
import { ImportedTable } from "@/components/results/imported-table";
import { SkippedTable } from "@/components/results/skipped-table";
import { ImportProgressBar } from "@/components/results/progress-bar";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { useStepper } from "@/hooks/use-stepper";
import { useCSVParser } from "@/hooks/use-csv-parser";
import { useImport } from "@/hooks/use-import";

/**
 * Main application page — single-page wizard with 3 steps:
 * 1. Upload CSV
 * 2. Preview data
 * 3. Import results
 */
export default function HomePage() {
  const stepper = useStepper();
  const csvParser = useCSVParser();
  const importHook = useImport();

  // ── Upload handler ──────────────────────────
  const handleFileAccepted = useCallback(
    async (file: File) => {
      await csvParser.parseFile(file);
    },
    [csvParser]
  );

  // When parsing completes, advance to preview
  // Using a pattern where we check for data changes
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        const { parseCSVFile } = await import("@/lib/csv-parser");
        const parsed = await parseCSVFile(file);
        stepper.goToPreview(file, parsed);
      } catch (err) {
        // Error shown via csvParser.error
        console.error("Parse error:", err);
      }
    },
    [stepper]
  );

  // ── Import handler ──────────────────────────
  const handleImport = useCallback(async () => {
    if (!stepper.file) return;

    stepper.goToImporting();
    try {
      const { importCSV } = await import("@/lib/api");
      
      // Start progress simulation
      importHook.reset();

      const response = await importCSV(stepper.file);
      stepper.goToResults(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed";
      // Go back to preview with error
      importHook.reset();
      alert(message);
      stepper.goBack();
    }
  }, [stepper, importHook]);

  // ── New import handler ──────────────────────
  const handleNewImport = useCallback(() => {
    stepper.goToUpload();
    csvParser.reset();
    importHook.reset();
  }, [stepper, csvParser, importHook]);

  // ── Download JSON handler ───────────────────
  const handleDownloadJSON = useCallback(() => {
    if (!stepper.importResult) return;
    const json = JSON.stringify(stepper.importResult.data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crm-import-results.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [stepper.importResult]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Stepper */}
            <Stepper currentStep={stepper.stepNumber} />

            <Separator className="mb-6" />

            {/* ═══ Step 1: Upload ═══ */}
            {stepper.currentStep === "upload" && (
              <div className="flex flex-col items-center gap-6 py-8 sm:py-12">
                <div className="text-center space-y-2 animate-in fade-in duration-300">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Upload your CSV file
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Drop any CSV — Facebook Leads, Google Ads, CRM exports, or custom data. 
                    Our AI will map it to your CRM schema.
                  </p>
                </div>

                <Dropzone
                  onFileAccepted={handleFileUpload}
                  isLoading={csvParser.isLoading}
                  error={csvParser.error}
                />
              </div>
            )}

            {/* ═══ Step 2: Preview ═══ */}
            {stepper.currentStep === "preview" && stepper.parsedData && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* File info bar */}
                <FileInfo
                  file={stepper.file!}
                  rowCount={stepper.parsedData.rowCount}
                  columnCount={stepper.parsedData.columnCount}
                  onRemove={handleNewImport}
                />

                {/* Preview heading */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Preview your data
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Review the data below before importing. No AI processing has happened yet.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      id="back-to-upload"
                      variant="outline"
                      size="sm"
                      onClick={handleNewImport}
                      className="gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </Button>
                    <Button
                      id="import-btn"
                      size="sm"
                      onClick={handleImport}
                      className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Import with AI
                    </Button>
                  </div>
                </div>

                {/* Data table */}
                <DataTable
                  headers={stepper.parsedData.headers}
                  rows={stepper.parsedData.rows}
                />
              </div>
            )}

            {/* ═══ Step 3a: Importing (Progress) ═══ */}
            {stepper.currentStep === "importing" && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                <ImportProgressBar
                  progress={importHook.progress}
                  status={importHook.status === "uploading" ? "uploading" : "processing"}
                />
              </div>
            )}

            {/* ═══ Step 3b: Results ═══ */}
            {stepper.currentStep === "results" && stepper.importResult && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Results header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Import Complete ✨
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Your CSV has been processed by Gemini AI and mapped to the CRM schema.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      id="download-json-btn"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadJSON}
                      className="gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download JSON
                    </Button>
                    <Button
                      id="new-import-btn"
                      size="sm"
                      onClick={handleNewImport}
                      className="gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      New Import
                    </Button>
                  </div>
                </div>

                {/* Statistics cards */}
                <StatsCards statistics={stepper.importResult.data.statistics} />

                {/* Imported & Skipped tables */}
                <Tabs defaultValue="imported" className="w-full">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="imported" className="gap-1.5 flex-1 sm:flex-initial">
                      <FileCheck2 className="h-3.5 w-3.5" />
                      Imported ({stepper.importResult.data.imported.length})
                    </TabsTrigger>
                    <TabsTrigger value="skipped" className="gap-1.5 flex-1 sm:flex-initial">
                      <FileX2 className="h-3.5 w-3.5" />
                      Skipped ({stepper.importResult.data.skipped.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="imported">
                    <ImportedTable records={stepper.importResult.data.imported} />
                  </TabsContent>

                  <TabsContent value="skipped">
                    <SkippedTable records={stepper.importResult.data.skipped} />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* ═══ Import Error ═══ */}
            {importHook.status === "error" && importHook.error && (
              <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in duration-300">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-semibold">Import Failed</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {importHook.error}
                  </p>
                </div>
                <Button variant="outline" onClick={handleNewImport} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}
