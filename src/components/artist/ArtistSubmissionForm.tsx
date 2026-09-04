"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useArtistSubmissionMutation, useMediaUpload } from "@/hooks/useArtistSubmissions";
import type { ListingSubmissionInput } from "@/lib/api/media";

const categories = ["PAINTINGS", "SCULPTURES", "CERAMICS", "DIGITAL_ART", "GLASS_ART", "WOODWORK", "PHOTOGRAPHY", "TEXTILE"] as const;

export default function ArtistSubmissionForm({ onSubmitted, onCancel }: { onSubmitted: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("PAINTINGS");
  const [artworkType, setArtworkType] = useState("ORIGINAL");
  const [medium, setMedium] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useMediaUpload();
  const submit = useArtistSubmissionMutation();
  const isDigital = artworkType === "DIGITAL";

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); setMessage(null);
    if (images.length < 1) { setError("Add at least one artwork image."); return; }
    if (isDigital && !digitalFile) { setError("Add the protected digital file for this artwork."); return; }
    try {
      const imageAssetIds: string[] = [];
      for (const file of images) imageAssetIds.push((await upload.mutateAsync({ file, purpose: "ARTWORK_IMAGE" })).id);
      const digitalAssetId = digitalFile ? (await upload.mutateAsync({ file: digitalFile, purpose: "DIGITAL_FILE" })).id : undefined;
      const input: ListingSubmissionInput = {
        title: title.trim(), description: description.trim() || undefined, price: Number(price), category, stock: isDigital ? 1 : 1,
        artworkDetails: { artworkType, fulfillmentMode: isDigital ? "DIGITAL" : "PHYSICAL", medium: medium.trim(), ...(width ? { width: Number(width) } : {}), ...(height ? { height: Number(height) } : {}), dimensionUnit: "cm" },
        imageAssetIds, ...(digitalAssetId ? { digitalAssetId } : {}),
      };
      await submit.mutateAsync(input);
      setMessage("Submitted for review. Your listing is saved and will remain unpublished until it is reviewed.");
      setImages([]); setDigitalFile(null);
      onSubmitted();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We couldn’t submit this artwork.");
    }
  };

  return <form onSubmit={submitForm} className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 mb-5 space-y-4">
    <div className="flex items-center justify-between gap-3"><div><h2 className="font-heading text-lg font-semibold text-gray-900">Submit artwork</h2><p className="text-xs text-gray-500 mt-1">Upload your files and submit one complete listing for review.</p></div><Button variant="ghost" type="button" onClick={onCancel}>Close</Button></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="block text-xs font-medium text-gray-600 sm:col-span-2">Title<input required minLength={3} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
      <label className="block text-xs font-medium text-gray-600">Price (₹)<input required type="number" min="1" step="1" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
      <label className="block text-xs font-medium text-gray-600">Category<select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50">{categories.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
      <label className="block text-xs font-medium text-gray-600">Artwork type<select value={artworkType} onChange={(e) => setArtworkType(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"><option value="ORIGINAL">Original</option><option value="LIMITED_EDITION">Limited edition</option><option value="MADE_TO_ORDER">Made to order</option><option value="DIGITAL">Digital</option></select></label>
      <label className="block text-xs font-medium text-gray-600">Medium<input required value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="Oil on canvas" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
      {!isDigital && <><label className="block text-xs font-medium text-gray-600">Width (cm)<input required type="number" min="0.1" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label><label className="block text-xs font-medium text-gray-600">Height (cm)<input required type="number" min="0.1" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label></>}
      <label className="block text-xs font-medium text-gray-600 sm:col-span-2">Description<textarea maxLength={2000} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none" /></label>
      <label className="block text-xs font-medium text-gray-600 sm:col-span-2">Artwork images (up to 10)<input required multiple accept="image/*" type="file" onChange={(e) => setImages(Array.from(e.target.files ?? []).slice(0, 10))} className="mt-1.5 block w-full text-sm text-gray-600" /><span className="block mt-1 text-xs font-normal text-gray-500">Files upload directly to the configured media provider.</span></label>
      {isDigital && <label className="block text-xs font-medium text-gray-600 sm:col-span-2">Protected digital file<input required accept="image/*,application/pdf,application/zip,video/*,audio/*" type="file" onChange={(e) => setDigitalFile(e.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm text-gray-600" /><span className="block mt-1 text-xs font-normal text-gray-500">This file is private and is only delivered through an authorized order download.</span></label>}
    </div>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}{message && <p role="status" className="text-sm text-green-700">{message}</p>}
    <div className="flex gap-3"><Button type="submit" loading={upload.isPending || submit.isPending}>Upload and submit</Button><Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button></div>
  </form>;
}
