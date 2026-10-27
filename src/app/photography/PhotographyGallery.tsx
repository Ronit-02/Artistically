"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { galleryPhotographs, photographyTopics, type PhotographyTopic } from "@/data/photography";

export default function PhotographyGallery() {
  const [topic, setTopic] = useState<PhotographyTopic | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const photographs = topic === "All" ? galleryPhotographs : galleryPhotographs.filter((photo) => photo.topic === topic);
  const selectedIndex = photographs.findIndex((photo) => photo.id === selectedId);
  const selected = photographs[selectedIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) { return; }
    if (selectedId === null) {
      if (dialog.open) { dialog.close(); }
      return;
    }
    if (!dialog.open) { dialog.showModal(); }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selectedId]);

  const markUnavailable = (id: string) => {
    setFailedImages((current) => new Set(current).add(id));
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div role="group" aria-label="Photography topics" className="flex flex-wrap gap-2">
          {(["All", ...photographyTopics] as const).map((item) => (
            <Button key={item} variant={topic === item ? "primary" : "ghost"} aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}</Button>
          ))}
        </div>
        <p role="status" className="text-sm tabular-nums text-gray-500">{photographs.length} photographs</p>
      </div>
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {photographs.map((photo) => (
          <figure key={photo.id} className="mb-8 break-inside-avoid">
            <button type="button" onClick={() => setSelectedId(photo.id)} aria-label={`View ${photo.title}`} aria-haspopup="dialog" className="block w-full overflow-hidden rounded-xl bg-gray-50 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-600">
              {failedImages.has(photo.id) ? <span className="flex aspect-[4/3] items-center justify-center px-6 text-sm text-gray-500">This photograph is currently unavailable.</span> : (
                <Image src={photo.image} alt={photo.caption} width={photo.width} height={photo.height} unoptimized={photo.image.startsWith("https://plus.unsplash.com/")} referrerPolicy="no-referrer" sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) calc((100vw - 104px) / 2), 370px" className="h-auto w-full" onError={() => markUnavailable(photo.id)} />
              )}
            </button>
            <figcaption className="pt-4">
              <p className="mb-1 text-xs text-accent-600">{photo.topic}</p>
              <h2 className="font-heading text-lg font-semibold leading-snug text-gray-900">{photo.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{photo.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby="photograph-title"
        aria-describedby="photograph-caption"
        onCancel={() => setSelectedId(null)}
        onClose={() => setSelectedId(null)}
        onClick={(event) => { if (event.target === event.currentTarget) { setSelectedId(null); } }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" && selectedIndex > 0) { event.preventDefault(); setSelectedId(photographs[selectedIndex - 1].id); }
          if (event.key === "ArrowRight" && selectedIndex < photographs.length - 1) { event.preventDefault(); setSelectedId(photographs[selectedIndex + 1].id); }
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-xl border border-gray-100 bg-white p-4 text-gray-900 shadow-md backdrop:bg-black/70 sm:p-6"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm tabular-nums text-gray-500">{selectedIndex + 1} / {photographs.length}</p>
          <Button variant="ghost" onClick={() => setSelectedId(null)} autoFocus>Close photograph</Button>
        </div>
        {selected && (
          <>
            {failedImages.has(selected.id) ? <p className="py-16 text-center text-sm text-gray-500">This photograph is currently unavailable.</p> : <Image src={selected.image} alt={selected.caption} width={selected.width} height={selected.height} unoptimized={selected.image.startsWith("https://plus.unsplash.com/")} referrerPolicy="no-referrer" sizes="(max-width: 1023px) calc(100vw - 80px), 960px" className="mx-auto max-h-[60dvh] w-full object-contain" onError={() => markUnavailable(selected.id)} />}
            <div className="mt-5">
              <h2 id="photograph-title" className="font-heading text-xl font-semibold">{selected.title}</h2>
              <p id="photograph-caption" className="mt-2 text-sm leading-relaxed text-gray-500">{selected.caption}</p>
            </div>
            <div className="mt-5 flex flex-wrap justify-between gap-3">
              <Button variant="secondary" disabled={selectedIndex <= 0} onClick={() => setSelectedId(photographs[selectedIndex - 1].id)}>Previous photograph</Button>
              <Button variant="secondary" disabled={selectedIndex >= photographs.length - 1} onClick={() => setSelectedId(photographs[selectedIndex + 1].id)}>Next photograph</Button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
