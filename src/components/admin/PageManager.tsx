"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Check,
  FileText,
  Plus,
  X,
} from "lucide-react";
import {
  fetchAllPages,
  updatePage,
  createPage,
  deletePage,
  type SitePage,
} from "@/lib/supabase-pages";
import RichTextEditor from "./RichTextEditor";

type ViewMode = "list" | "edit" | "create";

export default function PageManager() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingPage, setEditingPage] = useState<SitePage | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPages = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllPages();
      setPages(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load pages";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const startEdit = (page: SitePage) => {
    setEditingPage(page);
    setTitle(page.title);
    setContent(page.content);
    setViewMode("edit");
  };

  const startCreate = () => {
    setEditingPage(null);
    setTitle("");
    setSlug("");
    setContent("");
    setViewMode("create");
  };

  const cancelEdit = () => {
    setViewMode("list");
    setEditingPage(null);
    setTitle("");
    setSlug("");
    setContent("");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Save timed out. Please try again.")), 15000)
      );

      if (viewMode === "edit" && editingPage) {
        await Promise.race([
          updatePage(editingPage.id, {
            title: title.trim(),
            content,
          }),
          timeout,
        ]);
        setSuccess("Page updated successfully");
      } else if (viewMode === "create") {
        if (!slug.trim()) {
          setError("Slug is required");
          setIsSaving(false);
          return;
        }
        await Promise.race([
          createPage({
            slug: slug
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, "-")
              .replace(/-+/g, "-"),
            title: title.trim(),
            content,
          }),
          timeout,
        ]);
        setSuccess("Page created successfully");
      }
      await loadPages();
      cancelEdit();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save page";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePage(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Page deleted");
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete page";
      setError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 text-fresh-green animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Messages */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === "list" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-mid-gray">
              {pages.length} page{pages.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={startCreate}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-fresh-green text-white text-sm font-medium hover:bg-fresh-green/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Page
            </button>
          </div>

          {pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-soft-stone mx-auto mb-3" />
              <p className="text-sm text-mid-gray">No pages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="bg-white rounded-xl border border-soft-stone/50 shadow-sm p-4 flex items-center gap-4"
                >
                  <FileText className="h-5 w-5 text-mid-gray shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-rich-black">
                      {page.title}
                    </p>
                    <p className="text-xs text-mid-gray mt-0.5">
                      /pages/{page.slug} · Updated{" "}
                      {new Date(page.updated_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(page)}
                      className="p-2 rounded-lg text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {deleteConfirmId === page.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-xs font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-2 rounded-lg text-mid-gray hover:bg-soft-stone/50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(page.id)}
                        className="p-2 rounded-lg text-mid-gray hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── EDIT / CREATE VIEW ── */}
      {(viewMode === "edit" || viewMode === "create") && (
        <div>
          <button
            onClick={cancelEdit}
            className="flex items-center gap-1.5 text-sm text-mid-gray hover:text-rich-black transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pages
          </button>

          <h2 className="font-heading text-xl text-deep-forest mb-5">
            {viewMode === "edit" ? "Edit Page" : "New Page"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-mid-gray mb-1 block">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title"
                className="w-full h-10 px-3 rounded-lg border border-soft-stone text-sm text-rich-black placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green bg-white"
              />
            </div>

            {viewMode === "create" && (
              <div>
                <label className="text-xs font-medium text-mid-gray mb-1 block">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-mid-gray">/pages/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. terms, privacy"
                    className="flex-1 h-10 px-3 rounded-lg border border-soft-stone text-sm text-rich-black placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-mid-gray mb-1 block">
                Content
              </label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 h-10 px-5 rounded-lg bg-fresh-green text-white text-sm font-medium hover:bg-fresh-green/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Saving..." : "Save Page"}
              </button>
              <button
                onClick={cancelEdit}
                className="h-10 px-4 rounded-lg text-sm text-mid-gray hover:bg-soft-stone/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
