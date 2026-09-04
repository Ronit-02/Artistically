"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useArtistCollectionMutations, useArtistCollections } from "@/hooks/useCollections";
import { ApiClientError } from "@/lib/api/client";
import type { Product } from "@/types";
import type { ArtistCollectionDto } from "@/types/api";

type FormState = { name: string; description: string; coverImage: string; productIds: string[] };

const emptyForm: FormState = { name: "", description: "", coverImage: "", productIds: [] };

function collectionForm(collection: ArtistCollectionDto): FormState {
  return {
    name: collection.name,
    description: collection.description,
    coverImage: collection.coverImage,
    productIds: collection.products.map((product) => product.id),
  };
}

export default function ArtistCollectionManager({ products }: { products: Product[] }) {
  const { data: collections = [], isLoading, isError, refetch } = useArtistCollections();
  const mutations = useArtistCollectionMutations();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setError(null); setFormOpen(true); };
  const openEdit = (collection: ArtistCollectionDto) => { setEditingId(collection.id); setForm(collectionForm(collection)); setError(null); setFormOpen(true); };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) await mutations.update.mutateAsync({ id: editingId, input: form });
      else await mutations.create.mutateAsync(form);
      setFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (submitError) {
      setError(submitError instanceof ApiClientError ? submitError.message : "We couldn’t save this collection.");
    }
  };

  const archive = async (collection: ArtistCollectionDto) => {
    if (!window.confirm(`Archive “${collection.name}”? It will no longer be published.`)) return;
    setError(null);
    try {
      await mutations.archive.mutateAsync(collection.id);
    } catch (archiveError) {
      setError(archiveError instanceof ApiClientError ? archiveError.message : "We couldn’t archive this collection.");
    }
  };

  const toggleProduct = (productId: string) => {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((id) => id !== productId)
        : [...current.productIds, productId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm text-gray-500">Group your own artworks into collections. New collections remain unpublished until reviewed.</p></div>
        <Button variant="primary" size="sm" onClick={openCreate}>Create collection</Button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {formOpen && (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 sm:p-6" noValidate>
          <h2 className="font-heading text-lg font-semibold text-gray-900">{editingId ? "Edit collection" : "Create collection"}</h2>
          <label className="block text-sm font-medium text-gray-700">Name<input required minLength={3} maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 min-h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-normal outline-none focus:border-gray-400 focus:ring-2 focus:ring-accent-100" /></label>
          <label className="block text-sm font-medium text-gray-700">Description<textarea maxLength={2000} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1.5 w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-gray-400 focus:ring-2 focus:ring-accent-100" /></label>
          <label className="block text-sm font-medium text-gray-700">Cover image URL<input required type="url" value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} placeholder="https://…" className="mt-1.5 min-h-11 w-full rounded-lg border border-gray-200 px-3 text-sm font-normal outline-none focus:border-gray-400 focus:ring-2 focus:ring-accent-100" /></label>
          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Your active artworks</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {products.length === 0 ? <p className="text-sm text-gray-500">Create an active artwork before adding collection items.</p> : products.map((product) => (
                <label key={product.id} className="flex min-h-11 items-center gap-3 rounded-lg border border-gray-200 px-3 text-sm text-gray-700">
                  <input type="checkbox" checked={form.productIds.includes(String(product.id))} onChange={() => toggleProduct(String(product.id))} className="h-4 w-4" />
                  <span>{product.title}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-3"><Button type="submit" loading={mutations.create.isPending || mutations.update.isPending}>{editingId ? "Save collection" : "Create collection"}</Button><Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button></div>
        </form>
      )}

      {isLoading ? <p className="py-12 text-center text-sm text-gray-500">Loading your collections…</p> : isError ? <div className="py-12 text-center"><p className="mb-3 text-sm text-gray-500">We couldn’t load your collections.</p><Button variant="secondary" size="sm" onClick={() => void refetch()}>Try Again</Button></div> : collections.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center"><p className="text-sm text-gray-500">No artist collections yet.</p><p className="mt-1 text-xs text-gray-500">Create one to group your own artworks.</p></div> : <div className="grid gap-4 sm:grid-cols-2">{collections.map((collection) => <article key={collection.id} className="rounded-xl border border-gray-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-heading text-base font-semibold text-gray-900">{collection.name}</h3><p className="mt-1 text-xs text-gray-500">{collection.artworkCount} artwork{collection.artworkCount === 1 ? "" : "s"} · {collection.published ? "Published" : "Unpublished"}</p></div><span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">{collection.published ? "Published" : "Draft"}</span></div><p className="mt-3 line-clamp-2 text-sm text-gray-600">{collection.description}</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => openEdit(collection)}>Edit</Button><Button variant="ghost" size="sm" loading={mutations.archive.isPending} onClick={() => void archive(collection)}>Archive</Button></div></article>)}</div>}
    </div>
  );
}
