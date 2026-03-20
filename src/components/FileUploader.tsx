import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, AlertCircle, Loader2, CheckCircle2, X } from 'lucide-react';
import { validateFile, parseResume, type ParseResult } from '@/lib/parseResume';

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    setResult(null);
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseResume(file);
      setResult(parsed);
    } catch {
      setError('Failed to extract text. Please try a different file.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setError(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center
          transition-all duration-200 ease-out
          ${dragOver
            ? 'border-primary bg-secondary scale-[1.01]'
            : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Upload className="mx-auto h-10 w-10 text-primary/60 mb-4" />
        <p className="text-foreground font-medium text-lg">
          Drop your resume here or click to browse
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          PDF or DOCX · Max 5MB
        </p>
      </div>

      {/* Selected file */}
      {file && !result && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Upload button */}
      {file && !result && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="
            w-full rounded-lg bg-primary text-primary-foreground font-medium py-3 px-6
            transition-all duration-150 ease-out
            hover:brightness-110 active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          "
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting text…
            </>
          ) : (
            'Extract Text'
          )}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium text-sm">Text extracted successfully</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              ['File', result.fileName],
              ['Size', `${(result.fileSize / 1024).toFixed(1)} KB`],
              ['Words', `${result.text.split(/\s+/).length}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-secondary/60 p-3">
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="font-medium text-foreground truncate mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-medium text-foreground">Extracted Text</span>
              <button
                onClick={() => navigator.clipboard.writeText(result.text)}
                className="text-xs text-primary hover:underline transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 text-sm text-foreground/90 whitespace-pre-wrap font-sans max-h-96 overflow-y-auto leading-relaxed">
              {result.text || 'No text could be extracted from this file.'}
            </pre>
          </div>

          <button
            onClick={reset}
            className="
              w-full rounded-lg border border-border bg-card text-foreground font-medium py-3
              transition-all duration-150 ease-out
              hover:bg-secondary active:scale-[0.98]
            "
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}
