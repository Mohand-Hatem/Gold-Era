"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  HardDrive,
  Calendar,
  User as UserIcon,
  Download,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  FileCode,
  Hash,
  Loader2,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge, FileTypeBadge } from "@/components/ui/Badge";
import { DeleteFileModal } from "@/components/files/DeleteFileModal";
import { formatBytes, formatDateTime } from "@/lib/utils";
import { useToast } from "@/providers/ToastProvider";
import api, { getFileDownloadUrl } from "@/lib/axios";
import type { ApiResponse, FileItem } from "@/types/api";

export default function FileDetailsPage() {
  const params = useParams<{ id: string }>();
  const fileId = params?.id;
  const router = useRouter();
  const { success, error } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["files", fileId],
    queryFn: async () => {
      if (!fileId) throw new Error("Missing file ID");
      const res = await api.get<ApiResponse<FileItem>>(`/files/${fileId}`);
      return res.data.data;
    },
    enabled: !!fileId,
  });

  const file = data;
  const isImage = file?.mimeType.startsWith("image/");

  const handleCopyText = () => {
    if (!file?.extractedContent) return;
    navigator.clipboard.writeText(file.extractedContent);
    setCopied(true);
    success("Extracted text copied to clipboard", "Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Points the browser directly at the API's download endpoint instead of
   * fetching bytes through axios (see lib/axios.ts `getFileDownloadUrl` for
   * why — the endpoint 302-redirects to Cloudinary, and a credentialed
   * XHR/fetch that follows a cross-origin redirect gets blocked by CORS on
   * the far side; a passive resource load or navigation does not).
   */
  const handleDownload = (disposition: "inline" | "attachment") => {
    if (!file) return;
    const url = getFileDownloadUrl(file.id, disposition);

    if (disposition === "inline") {
      if (isImage) {
        setIsLoadingPreview(true);
        setImagePreviewUrl(url);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    // Cloudinary already sets `Content-Disposition: attachment; filename=...`
    // server-side (ADR-044), so the browser downloads in place under the
    // original filename without navigating away — the `download` attribute
    // isn't load-bearing for a cross-origin URL, but costs nothing to keep.
    const link = document.createElement("a");
    link.href = url;
    link.download = file.originalName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading document details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !file) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-2xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 shadow-sm">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          File Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The requested document could not be found or you do not have
          permission to view it.
        </p>
        <Link href="/files">
          <Button
            variant="brand"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="cursor-pointer"
          >
            Back to My Files
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <Link
            href="/files"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Files
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-xl">
              {file.originalName}
            </h1>
            <FileTypeBadge
              category={file.category}
              extension={file.extension}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("inline")}
            isLoading={isLoadingPreview}
            leftIcon={<ExternalLink className="h-4 w-4" />}
            className="cursor-pointer"
          >
            Preview
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={() => handleDownload("attachment")}
            leftIcon={<Download className="h-4 w-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Download
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="cursor-pointer"
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: File Metadata Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                File Metadata
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Verified system properties and storage details
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-sm divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pt-2 first:pt-0">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Original Filename
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 break-all mt-0.5">
                  {file.originalName}
                </p>
              </div>

              <div className="pt-3">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  File Size
                </span>
                <p className="font-mono text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 mt-0.5">
                  <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                  {formatBytes(file.size)} ({file.size.toLocaleString()} bytes)
                </p>
              </div>

              <div className="pt-3">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Verified MIME Type
                </span>
                <p className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 mt-1 inline-block">
                  {file.mimeType}
                </p>
              </div>

              <div className="pt-3">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  SHA-256 Checksum
                </span>
                <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 break-all mt-1">
                  <Hash className="h-3 w-3 text-slate-400 inline mr-1" />
                  {file.checksum}
                </p>
              </div>

              <div className="pt-3">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Text Extraction Status
                </span>
                <div className="mt-1">
                  {file.extractionStatus === "DONE" && (
                    <Badge variant="brand">
                      DONE (Successfully Extracted)
                    </Badge>
                  )}
                  {file.extractionStatus === "PENDING" && (
                    <Badge variant="default">PENDING</Badge>
                  )}
                  {file.extractionStatus === "SKIPPED" && (
                    <Badge variant="default">SKIPPED (Image / Non-text)</Badge>
                  )}
                  {file.extractionStatus === "FAILED" && (
                    <Badge variant="default">FAILED</Badge>
                  )}
                </div>
              </div>

              <div className="pt-3">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Uploaded Date
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatDateTime(file.createdAt)}
                </p>
              </div>

              {file.owner && (
                <div className="pt-3">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Owner
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs mt-0.5">
                    <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                    {file.owner.name} ({file.owner.email})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview & Extracted Content Viewer */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="flex flex-col h-full min-h-112.5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  {isImage ? "Image Preview" : "Extracted Text Content"}
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {file.extractedContent
                    ? `${file.extractedContent.length.toLocaleString()} characters extracted`
                    : isImage
                      ? "Full resolution image asset"
                      : "Automated text extraction result"}
                </CardDescription>
              </div>

              {file.extractedContent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyText}
                  leftIcon={
                    copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )
                  }
                  className="cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy Text"}
                </Button>
              )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-center">
              {file.extractedContent ? (
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 p-5 font-mono text-xs text-slate-100 whitespace-pre-wrap break-words leading-relaxed max-h-125 overflow-y-auto shadow-inner">
                  {file.extractedContent}
                </div>
              ) : isImage ? (
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
                  {imagePreviewUrl ? (
                    <div className="relative max-h-105 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
                      <img
                        src={imagePreviewUrl}
                        alt={file.originalName}
                        className="max-h-100 w-auto object-contain rounded-lg"
                        onLoad={() => setIsLoadingPreview(false)}
                        onError={() => {
                          setIsLoadingPreview(false);
                          setImagePreviewUrl(null);
                          error("Failed to load image preview.", "Preview Failed");
                        }}
                      />
                    </div>
                  ) : (
                    <div className="py-8 space-y-3">
                      <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                        <ImageIcon className="h-7 w-7" />
                      </div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm">
                        Image Asset Ready
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        Click Preview to render this photo or download in full quality.
                      </p>
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => handleDownload("inline")}
                        isLoading={isLoadingPreview}
                        leftIcon={<ExternalLink className="h-4 w-4" />}
                        className="bg-blue-600 text-white cursor-pointer"
                      >
                        Load Image Preview
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950">
                  <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="font-bold text-slate-800 dark:text-white text-sm">
                    No Extracted Content
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                    {file.extractionStatus === "FAILED"
                      ? "Extraction failed due to an unreadable or encrypted document format."
                      : "This file format does not contain extractable plain text."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteFileModal
        file={file}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={() => router.push("/files")}
      />
    </div>
  );
}
