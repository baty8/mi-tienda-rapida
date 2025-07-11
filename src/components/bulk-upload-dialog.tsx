"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileCsv, Download } from 'lucide-react';

export function BulkUploadDialog() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      setFile(null);
    }, 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Bulk Product Upload</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple products at once.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
            </Button>
            <div className="space-y-2">
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="csv-file" 
                    type="file" 
                    accept=".csv" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="flex-grow"
                  />
                </div>
                {file && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm">
                        <FileCsv className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{file.name}</span>
                    </div>
                )}
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? 'Uploading...' : 'Upload Products'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
