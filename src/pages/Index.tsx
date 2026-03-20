import FileUploader from '@/components/FileUploader';
import { FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground leading-tight">Algoprep</h1>
            <p className="text-xs text-muted-foreground">Resume Parser · Phase 1</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground tracking-tight" style={{ lineHeight: '1.15' }}>
            Extract text from your resume
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-balance">
            Upload a PDF or DOCX file and get clean, structured text output in seconds.
          </p>
        </div>

        <FileUploader />
      </main>
    </div>
  );
};

export default Index;
