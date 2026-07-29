'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/layout/glass-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AssignmentUploaderProps {
  assignmentTitle?: string;
  dueDate?: string;
  maxScore?: number;
}

export function AssignmentUploader({
  assignmentTitle = 'Bài tập thực hành tuần này',
  dueDate = '23:59 Chủ Nhật tuần này',
  maxScore = 100,
}: AssignmentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile({ name: droppedFile.name, size: droppedFile.size });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile({ name: selectedFile.name, size: selectedFile.size });
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h4 className="font-bold text-sm text-foreground">{assignmentTitle}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hạn nộp: {dueDate} · Điểm tối đa: {maxScore}đ
          </p>
        </div>
        <Badge variant={submitted ? 'success' : 'warning'}>
          {submitted ? 'Đã nộp bài' : 'Chưa nộp bài'}
        </Badge>
      </div>

      {!submitted ? (
        <div className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-card',
              dragActive
                ? 'border-primary bg-primary/5 shadow-inner'
                : 'border-border hover:border-primary/40 hover:bg-secondary/20',
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.zip,.png,.jpg"
            />

            {!file ? (
              <label htmlFor="file-upload" className="cursor-pointer block space-y-2">
                <Upload className="mx-auto h-10 w-10 text-primary animate-bounce" />
                <p className="text-sm font-bold text-foreground">
                  Kéo thả file bài tập vào đây hoặc <span className="text-primary underline">chọn file từ máy</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ định dạng PDF, DOCX, ZIP, PNG, JPG (Tối đa 25MB)
                </p>
              </label>
            ) : (
              <div className="flex items-center justify-between bg-secondary/40 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive p-1 rounded-md"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <Button
            className="w-full font-bold shadow-md"
            disabled={!file || uploading}
            onClick={handleSubmit}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Đang nộp file lên hệ thống...' : 'Xác nhận nộp bài tập'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <h5 className="font-bold text-sm text-foreground">Bài tập đã được nộp thành công!</h5>
          <p className="text-xs text-muted-foreground">
            File đã lưu: <span className="font-semibold text-foreground">{file?.name}</span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            onClick={() => setSubmitted(false)}
          >
            Nộp lại bài tập mới
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
