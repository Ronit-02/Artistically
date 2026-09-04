"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProductMutations, useProducts } from "@/hooks/useProducts";
import { useArtistSettlements, useCreateArtistPayout, usePublishDigitalDelivery, useSellerOrders, useUpdateSellerOrderItemStatus } from "@/hooks/useOrders";
import { useSellerReviews } from "@/hooks/useReviews";
import { useArtist, useUpdateArtistProfile } from "@/hooks/useArtists";
import { useUpdateProfile } from "@/hooks/useProfile";
import type { Artist, ArtworkDetails, Product } from "@/types";
import type { AuthUserDto } from "@/types/api";
import type { ProductMutationInput } from "@/lib/api/products";
import { ApiClientError } from "@/lib/api/client";
import { getArtistPortalTab, type ArtistPortalTab } from "@/lib/artist-portal-tabs";
import { isProductSold } from "@/lib/product-availability";
import ArtistVerificationForm from "@/components/artist/ArtistVerificationForm";
import ArtistCollectionManager from "@/components/artist/ArtistCollectionManager";
import ArtistSubmissionForm from "@/components/artist/ArtistSubmissionForm";

type Tab = ArtistPortalTab;
type ProfileForm = { firstName: string; lastName: string; handle: string; bio: string };

/* ── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, change, icon }: {
  label: string; value: string; change?: string; icon: string;
}) {
  const positive = change && !change.startsWith("-");
  const isUnavailableRating = label === "Avg. Rating";
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {change}
          </span>
        )}
      </div>
      <p className="font-heading text-2xl font-semibold text-gray-900 tracking-tight-heading">{isUnavailableRating ? "—" : value}</p>
      <p className="text-xs text-gray-500 mt-1">{isUnavailableRating ? "Review metrics unavailable" : label}</p>
    </div>
  );
}

function ArtistProfileSettings({ currentUser, artist }: { currentUser: AuthUserDto; artist: Artist | null | undefined }) {
  const artistId = currentUser.artist?.id;
  const updateProfileMutation = useUpdateProfile();
  const updateArtistMutation = useUpdateArtistProfile();
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    handle: artist?.handle ?? currentUser.artist?.handle ?? "",
    bio: artist?.bio ?? "",
  });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string[]>>({});

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!artistId) return;
    setProfileMessage(null);
    setProfileError(null);
    setProfileFieldErrors({});

    try {
      await updateProfileMutation.mutateAsync({
        userId: currentUser.id,
        input: { firstName: profileForm.firstName.trim(), lastName: profileForm.lastName.trim() },
      });
      await updateArtistMutation.mutateAsync({
        artistId,
        input: { handle: profileForm.handle.trim(), bio: profileForm.bio.trim() },
      });
      setProfileMessage("Profile saved.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "We couldn’t save your profile.");
      setProfileFieldErrors(error instanceof ApiClientError ? error.fields ?? {} : {});
    }
  };

  return (
    <div className="max-w-lg">
      <p className="text-sm text-gray-500 mb-5">Manage your artist profile and preferences</p>
      <form onSubmit={handleProfileSubmit} className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 space-y-4">
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5">Changes are saved to your Artistically profile.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-xs font-medium text-gray-600">First name<input required value={profileForm.firstName} onChange={(event) => setProfileForm((form) => ({ ...form, firstName: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" /></label>
          <label className="block text-xs font-medium text-gray-600">Last name<input required value={profileForm.lastName} onChange={(event) => setProfileForm((form) => ({ ...form, lastName: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" /></label>
        </div>
        <label className="block text-xs font-medium text-gray-600">Email<input type="email" value={currentUser.email} readOnly aria-describedby="artist-email-note" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal text-gray-500 bg-gray-50 outline-none" /><span id="artist-email-note" className="block mt-1 text-xs font-normal text-gray-500">Email changes are not available from this workspace.</span></label>
        <label className="block text-xs font-medium text-gray-600">Artist handle<input required pattern="^@[a-z0-9_]+$" title="Use @ followed by lowercase letters, numbers, or underscores" value={profileForm.handle} onChange={(event) => setProfileForm((form) => ({ ...form, handle: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" /></label>
        <label className="block text-xs font-medium text-gray-600">Bio<textarea value={profileForm.bio} onChange={(event) => setProfileForm((form) => ({ ...form, bio: event.target.value }))} rows={4} maxLength={500} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all resize-none" /></label>
        {profileError && <p role="alert" className="text-sm text-red-600">{profileError}</p>}
        {Object.keys(profileFieldErrors).length > 0 && <ul role="alert" className="text-sm text-red-600 list-disc pl-5 space-y-1">{Object.entries(profileFieldErrors).flatMap(([field, messages]) => messages.map((message) => <li key={`${field}-${message}`}>{field}: {message}</li>))}</ul>}
        {profileMessage && <p role="status" className="text-sm text-green-600">{profileMessage}</p>}
        <div className="flex gap-3 pt-2">
          <Button variant="primary" type="submit" loading={updateProfileMutation.isPending || updateArtistMutation.isPending}>Save profile</Button>
          <Button variant="secondary" type="button" onClick={() => setProfileForm({ firstName: currentUser.firstName, lastName: currentUser.lastName, handle: artist?.handle ?? currentUser.artist?.handle ?? "", bio: artist?.bio ?? "" })}>Reset</Button>
        </div>
      </form>
          {artistId && <ArtistVerificationForm artistId={artistId} />}
    </div>
  );
}

const PRODUCT_CATEGORIES: ProductMutationInput["category"][] = [
  "PAINTINGS", "SCULPTURES", "CERAMICS", "DIGITAL_ART", "GLASS_ART", "WOODWORK", "PHOTOGRAPHY", "TEXTILE",
];
const MAX_LISTING_IMAGES = 10;

function formatFieldErrorLabel(field: string) {
  return field
    .split(".")
    .map((part) => part.replace(/([a-z])([A-Z])/g, "$1 $2"))
    .join(" ")
    .replace(/^./, (character) => character.toUpperCase());
}

function ArtworkForm({ product, onSaved, onCancel }: { product: Product | null; onSaved: () => void; onCancel: () => void }) {
  const mutations = useProductMutations();
  const [form, setForm] = useState({
    title: product?.title ?? "",
    price: product ? String(product.price) : "",
    category: (product?.category ?? "PAINTINGS") as ProductMutationInput["category"],
    stock: product?.stock !== undefined ? String(product.stock) : "1",
    images: product?.images?.length ? product.images : product?.image ? [product.image] : [""],
    originalPrice: product?.originalPrice ? String(product.originalPrice) : "",
    discount: product?.discount ? String(product.discount) : "",
    badge: product?.badge ?? "",
    description: product?.description ?? "",
    artworkType: (product?.artworkDetails?.artworkType ?? "ORIGINAL") as ArtworkDetails["artworkType"],
    medium: product?.artworkDetails?.medium ?? "",
    materials: product?.artworkDetails?.materials ?? "",
    width: product?.artworkDetails?.width !== null && product?.artworkDetails?.width !== undefined ? String(product.artworkDetails.width) : "",
    height: product?.artworkDetails?.height !== null && product?.artworkDetails?.height !== undefined ? String(product.artworkDetails.height) : "",
    depth: product?.artworkDetails?.depth !== null && product?.artworkDetails?.depth !== undefined ? String(product.artworkDetails.depth) : "",
    year: product?.artworkDetails?.year !== null && product?.artworkDetails?.year !== undefined ? String(product.artworkDetails.year) : "",
    condition: product?.artworkDetails?.condition ?? "",
    framing: product?.artworkDetails?.framing ?? "",
    editionSize: product?.artworkDetails?.editionSize !== null && product?.artworkDetails?.editionSize !== undefined ? String(product.artworkDetails.editionSize) : "",
    editionNumber: product?.artworkDetails?.editionNumber !== null && product?.artworkDetails?.editionNumber !== undefined ? String(product.artworkDetails.editionNumber) : "",
    authenticity: product?.artworkDetails?.authenticity ?? "",
    provenance: product?.artworkDetails?.provenance ?? "",
    fulfillmentMode: (product?.artworkDetails?.artworkType === "DIGITAL" ? "DIGITAL" : "PHYSICAL") as ArtworkDetails["fulfillmentMode"],
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const isPending = mutations.create.isPending || mutations.update.isPending;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    const input: ProductMutationInput = {
      title: form.title.trim(),
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      images: form.images.map((image) => image.trim()).filter(Boolean),
      ...(form.originalPrice ? { originalPrice: Number(form.originalPrice) } : {}),
      ...(form.discount ? { discount: Number(form.discount) } : {}),
      ...(form.badge.trim() ? { badge: form.badge.trim() } : {}),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      artworkDetails: {
        artworkType: form.artworkType,
        fulfillmentMode: form.fulfillmentMode,
        dimensionUnit: "cm",
        ...(form.medium.trim() ? { medium: form.medium.trim() } : {}),
        ...(form.materials.trim() ? { materials: form.materials.trim() } : {}),
        ...(form.width ? { width: Number(form.width) } : {}),
        ...(form.height ? { height: Number(form.height) } : {}),
        ...(form.depth ? { depth: Number(form.depth) } : {}),
        ...(form.year ? { year: Number(form.year) } : {}),
        ...(form.condition.trim() ? { condition: form.condition.trim() } : {}),
        ...(form.framing.trim() ? { framing: form.framing.trim() } : {}),
        ...(form.artworkType === "LIMITED_EDITION" && form.editionSize ? { editionSize: Number(form.editionSize) } : {}),
        ...(form.artworkType === "LIMITED_EDITION" && form.editionNumber ? { editionNumber: Number(form.editionNumber) } : {}),
        ...(form.authenticity.trim() ? { authenticity: form.authenticity.trim() } : {}),
        ...(form.provenance.trim() ? { provenance: form.provenance.trim() } : {}),
      },
    };

    try {
      if (product && typeof product.id === "string") {
        await mutations.update.mutateAsync({ id: product.id, input });
      } else {
        await mutations.create.mutateAsync(input);
      }
      onSaved();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "We couldn’t save this artwork.");
      setFieldErrors(mutationError instanceof ApiClientError ? mutationError.fields ?? {} : {});
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 mb-5 space-y-4">
      <div className="flex items-center justify-between gap-3"><h2 className="font-heading text-lg font-semibold text-gray-900">{product ? "Edit artwork" : "Add artwork"}</h2><Button variant="ghost" type="button" onClick={onCancel}>Close</Button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block text-xs font-medium text-gray-600 sm:col-span-2">Title<input required minLength={3} maxLength={200} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600">Price (₹)<input required type="number" min="1" step="1" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600">Stock<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600">Category<select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ProductMutationInput["category"] }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50">{PRODUCT_CATEGORIES.map((category) => <option key={category} value={category}>{category.replaceAll("_", " ")}</option>)}</select></label>
        <div className="sm:col-span-2">
          <p className="block text-xs font-medium text-gray-600 mb-1.5">Artwork image URLs</p>
          <div className="space-y-2">
            {form.images.map((image, index) => (
              <div key={index} className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`artwork-image-${index}`}>Artwork image URL {index + 1}</label>
                <input id={`artwork-image-${index}`} required type="url" value={image} onChange={(event) => setForm((current) => ({ ...current, images: current.images.map((value, imageIndex) => imageIndex === index ? event.target.value : value) }))} placeholder="https://…" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" />
                {form.images.length > 1 && <button type="button" aria-label={`Remove artwork image ${index + 1}`} onClick={() => setForm((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))} className="min-h-11 min-w-11 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-red-300 hover:text-red-600 cursor-pointer">×</button>}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 mt-2">
            <p className="text-xs text-gray-500">Use up to {MAX_LISTING_IMAGES} images. The first image is the primary artwork image.</p>
            <button type="button" disabled={form.images.length >= MAX_LISTING_IMAGES} onClick={() => setForm((current) => ({ ...current, images: [...current.images, ""] }))} className="min-h-11 shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-gray-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">Add image</button>
          </div>
        </div>
        <label className="block text-xs font-medium text-gray-600">Artwork type<select value={form.artworkType} onChange={(event) => setForm((current) => { const artworkType = event.target.value as typeof current.artworkType; return { ...current, artworkType, fulfillmentMode: artworkType === "DIGITAL" ? "DIGITAL" : "PHYSICAL" }; })} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"><option value="ORIGINAL">Original</option><option value="LIMITED_EDITION">Limited edition</option><option value="MADE_TO_ORDER">Made to order</option><option value="DIGITAL">Digital</option></select></label>
        <label className="block text-xs font-medium text-gray-600">Fulfillment<select value={form.fulfillmentMode} onChange={(event) => setForm((current) => ({ ...current, fulfillmentMode: event.target.value as typeof current.fulfillmentMode }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"><option value={form.artworkType === "DIGITAL" ? "DIGITAL" : "PHYSICAL"}>{form.artworkType === "DIGITAL" ? "Digital" : "Physical"}</option></select></label>
        {form.artworkType === "LIMITED_EDITION" && <>
          <label className="block text-xs font-medium text-gray-600">Edition size<input required type="number" min="1" step="1" value={form.editionSize} onChange={(event) => setForm((current) => ({ ...current, editionSize: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
          <label className="block text-xs font-medium text-gray-600">Edition number (optional)<input type="number" min="1" step="1" max={form.editionSize || undefined} value={form.editionNumber} onChange={(event) => setForm((current) => ({ ...current, editionNumber: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        </>}
        <label className="block text-xs font-medium text-gray-600">Medium<input required maxLength={100} value={form.medium} onChange={(event) => setForm((current) => ({ ...current, medium: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600">Materials<input maxLength={300} value={form.materials} onChange={(event) => setForm((current) => ({ ...current, materials: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600">Width (cm)<input required={form.fulfillmentMode === "PHYSICAL"} type="number" min="0.01" step="0.01" value={form.width} onChange={(event) => setForm((current) => ({ ...current, width: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600">Height (cm)<input required={form.fulfillmentMode === "PHYSICAL"} type="number" min="0.01" step="0.01" value={form.height} onChange={(event) => setForm((current) => ({ ...current, height: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600">Depth (cm)<input type="number" min="0.01" step="0.01" value={form.depth} onChange={(event) => setForm((current) => ({ ...current, depth: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600">Year<input type="number" min="1000" max="2100" step="1" value={form.year} onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600">Condition<input maxLength={100} value={form.condition} onChange={(event) => setForm((current) => ({ ...current, condition: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600">Framing<input maxLength={100} value={form.framing} onChange={(event) => setForm((current) => ({ ...current, framing: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" /></label>
        <label className="block text-xs font-medium text-gray-600 sm:col-span-2">Authenticity<textarea maxLength={500} rows={2} value={form.authenticity} onChange={(event) => setForm((current) => ({ ...current, authenticity: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none" /></label>
        <label className="block text-xs font-medium text-gray-600 sm:col-span-2">Provenance<textarea maxLength={1000} rows={2} value={form.provenance} onChange={(event) => setForm((current) => ({ ...current, provenance: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none" /></label>
        <label className="block text-xs font-medium text-gray-600 sm:col-span-2">Description<textarea maxLength={2000} rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none" /></label>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {Object.keys(fieldErrors).length > 0 && <ul role="alert" className="text-sm text-red-600 list-disc pl-5 space-y-1">{Object.entries(fieldErrors).flatMap(([field, messages]) => messages.map((message) => <li key={`${field}-${message}`}>{formatFieldErrorLabel(field)}: {message}</li>))}</ul>}
      <div className="flex gap-3"><Button type="submit" loading={isPending}>{product ? "Save artwork" : "Publish artwork"}</Button><Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}

/* ── Dashboard Page ─────────────────────────────────────────────────────── */
export default function ArtistPortalPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(() =>
    getArtistPortalTab(typeof window === "undefined" ? "" : window.location.search),
  );
  useEffect(() => {
    const handleHistoryChange = () => setTab(getArtistPortalTab(window.location.search));
    window.addEventListener("popstate", handleHistoryChange);
    return () => window.removeEventListener("popstate", handleHistoryChange);
  }, []);
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const artistId = currentUser?.artist?.id;
  const { data: artist } = useArtist(artistId ?? "");
  const {
    data: artistProducts = [],
    isPending: isProductsPending,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useProducts({ artistId });
  const productsLoading = isAuthPending || isProductsPending;
  const { data: sellerOrders = [], isPending: isSellerOrdersPending, isError: isSellerOrdersError, refetch: refetchSellerOrders } = useSellerOrders();
  const { data: settlements, isPending: isSettlementsPending, isError: isSettlementsError, refetch: refetchSettlements } = useArtistSettlements();
  const payoutMutation = useCreateArtistPayout();
  const sellerOrderStatusMutation = useUpdateSellerOrderItemStatus();
  const digitalDeliveryMutation = usePublishDigitalDelivery();
  const { data: sellerReviews = [], isPending: isSellerReviewsPending, isError: isSellerReviewsError, refetch: refetchSellerReviews } = useSellerReviews();
  const recentProducts = artistProducts.slice(0, 5);
  const availableInventory = artistProducts.reduce((total, product) => total + (product.stock ?? 0), 0);
  const reviewAverage = sellerReviews.length > 0 ? sellerReviews.reduce((total, review) => total + review.rating, 0) / sellerReviews.length : null;
  const grossSales = sellerOrders.reduce((total, order) => total + order.items.reduce((orderTotal, item) => orderTotal + item.price * item.quantity, 0), 0);
  const [artworkEditor, setArtworkEditor] = useState<Product | null | false>(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [digitalDeliveryItemId, setDigitalDeliveryItemId] = useState<string | null>(null);
  const [digitalAssetReference, setDigitalAssetReference] = useState("");
  const [digitalDownloadLimit, setDigitalDownloadLimit] = useState("3");
  const [payoutAmount, setPayoutAmount] = useState("");
  const productMutations = useProductMutations();

  const moveToTab = (nextTab: Tab) => {
    setTab(nextTab);
    const params = new URLSearchParams(window.location.search);
    if (nextTab === "overview") params.delete("tab");
    else params.set("tab", nextTab);
    const query = params.toString();
    router.replace(`${window.location.pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };
  const openArtworkCreator = () => { moveToTab("artworks"); setArtworkEditor(null); };
  const archiveArtwork = async (product: Product) => {
    if (typeof product.id !== "string" || !window.confirm(`Archive “${product.title}”? It will be removed from public listings.`)) return;
    setArchiveError(null);
    try {
      await productMutations.archive.mutateAsync(product.id);
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : "We couldn’t archive this artwork.");
    }
  };


  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "artworks", label: "Artworks" },
    { key: "orders", label: "Orders" },
    { key: "analytics", label: "Analytics" },
    { key: "reviews", label: "Reviews" },
    { key: "settings", label: "Settings" },
  ];
  const moveTab = (index: number, direction: 1 | -1) => {
    const nextIndex = (index + direction + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    moveToTab(nextTab.key);
    requestAnimationFrame(() => document.getElementById(`artist-tab-${nextTab.key}`)?.focus());
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight-heading">
          Welcome back, {currentUser?.firstName ?? "Artist"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your artworks today.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto" role="tablist" aria-label="Artist portal sections">
        {tabs.map((t) => (
          <button
            key={t.key}
            id={`artist-tab-${t.key}`}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            aria-controls={`artist-panel-${t.key}`}
            tabIndex={tab === t.key ? 0 : -1}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") { event.preventDefault(); moveTab(tabs.findIndex((candidate) => candidate.key === t.key), 1); }
              if (event.key === "ArrowLeft") { event.preventDefault(); moveTab(tabs.findIndex((candidate) => candidate.key === t.key), -1); }
            }}
            onClick={() => moveToTab(t.key)}
            className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap border-none cursor-pointer ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700 bg-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ──────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div id="artist-panel-overview" role="tabpanel" aria-labelledby="artist-tab-overview" tabIndex={0} className="space-y-8">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Published artworks" value={String(artistProducts.length)} icon="M4 6h16M4 12h16M4 18h16" />
            <StatCard label="Available inventory" value={String(availableInventory)} icon="M4 7h16v12H4zM8 7V5h8v2" />
            <StatCard label="Incoming orders" value={String(sellerOrders.length)} icon="M3 6h18M6 6v12h12V6M9 10h6M9 14h4" />
            <StatCard label="Average review" value={reviewAverage === null ? "—" : `${reviewAverage.toFixed(1)} / 5`} icon="M11 4l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" />
          </div>
          <div className="hidden grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Sales metrics unavailable" value="—" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="Sales metrics unavailable" value="—" icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            <StatCard label="Audience metrics unavailable" value="—" icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <StatCard label="Avg. Rating" value="4.8" icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </div>

          {/* Recent artworks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionHeader title="Recent Artworks" />
              <Button variant="primary" size="sm" onClick={openArtworkCreator}>Add artwork</Button>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Artwork", "Category", "Price", "Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productsLoading ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">Loading your published artworks…</td></tr>
                  ) : isProductsError ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center"><p className="text-sm text-gray-500 mb-3">We couldn’t load your artworks.</p><Button variant="secondary" size="sm" onClick={() => refetchProducts()}>Try Again</Button></td></tr>
                  ) : recentProducts.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">No published artworks yet.</td></tr>
                  ) : recentProducts.map((p, i) => (
                    <tr key={p.id} className={`${i < recentProducts.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50 transition-colors`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                            <Image src={p.image} alt={p.title} fill className="object-cover" sizes="40px" />
                          </div>
                          <div>
                            <p className="text-sm font-heading font-medium text-gray-900 line-clamp-1">{p.title}</p>
                            <p className="text-xs text-gray-500">{p.artistName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded font-medium">{p.category}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-900 font-medium">₹{p.price.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${isProductSold(p.stock) ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-600"}`}>
                          {isProductSold(p.stock) ? "Sold" : "Published"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent orders */}
          <div>
            <SectionHeader title="Recent Orders" className="mb-4" />
            {isSellerOrdersPending ? (
              <div className="bg-white border border-gray-100 rounded-xl px-5 py-8 text-center text-sm text-gray-500">Loading recent orders…</div>
            ) : sellerOrders.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl px-5 py-8 text-center">
                <p className="text-sm text-gray-500">No incoming orders yet.</p>
                <p className="text-xs text-gray-500 mt-1">Orders for your published artworks will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sellerOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-900">Order {order.id}</p>
                      <span className="text-xs font-medium rounded bg-gray-50 text-gray-600 px-2 py-1">{order.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{order.items.length} artwork item{order.items.length === 1 ? "" : "s"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionHeader title="Settlement records" className="mb-4" />
            {isAuthPending || isSettlementsPending ? (
              <div className="bg-white border border-gray-100 rounded-xl px-5 py-8 text-center text-sm text-gray-500">Loading settlement records…</div>
            ) : isSettlementsError ? (
              <div className="bg-white border border-gray-100 rounded-xl px-5 py-8 text-center"><p className="text-sm text-gray-500 mb-3">We couldn’t load settlement records.</p><Button variant="secondary" size="sm" onClick={() => refetchSettlements()}>Try Again</Button></div>
            ) : !settlements || (settlements.sellerOrders.length === 0 && settlements.payouts.length === 0 && settlements.settlements.length === 0) ? (
              <div className="bg-white border border-gray-100 rounded-xl px-5 py-8 text-center"><p className="text-sm text-gray-500">No settlement records yet.</p><p className="text-xs text-gray-500 mt-1">Seller allocations and Stripe payout events will appear here after a verified sale.</p></div>
            ) : (
              <div className="space-y-4">
                {settlements.statement && <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ["Gross sales", settlements.statement.grossAmountMinor],
                    ["Platform fees", settlements.statement.platformFeeAmountMinor],
                    ["Refunds", settlements.statement.refundAmountMinor],
                    ["Outstanding", settlements.statement.outstandingAmountMinor],
                  ].map(([label, amount]) => <div key={label} className="bg-white border border-gray-100 rounded-xl px-4 py-3"><p className="text-xs text-gray-500">{label}</p><p className="text-sm font-medium text-gray-900 mt-1">₹{(Number(amount) / 100).toLocaleString("en-IN")}</p></div>)}
                </div>}
                {settlements.statement && <div className="bg-white border border-gray-100 rounded-xl px-5 py-4"><div className="flex flex-wrap items-end justify-between gap-4"><div><label htmlFor="artist-payout-amount" className="block text-sm font-medium text-gray-900">Request a payout</label><p className="text-xs text-gray-500 mt-1">Available balance: ₹{(settlements.statement.outstandingAmountMinor / 100).toLocaleString("en-IN")}</p></div><div className="flex flex-wrap items-end gap-2"><div><label htmlFor="artist-payout-amount" className="sr-only">Payout amount in rupees</label><input id="artist-payout-amount" inputMode="decimal" value={payoutAmount} onChange={(event) => setPayoutAmount(event.target.value)} placeholder="Amount in ₹" className="min-h-11 w-32 rounded-lg border border-gray-200 px-3 text-sm" /></div><Button size="sm" loading={payoutMutation.isPending} disabled={!Number.isFinite(Number(payoutAmount)) || Number(payoutAmount) <= 0 || Math.round(Number(payoutAmount) * 100) > settlements.statement.outstandingAmountMinor} onClick={() => payoutMutation.mutate({ amountMinor: Math.round(Number(payoutAmount) * 100), idempotencyKey: crypto.randomUUID() }, { onSuccess: () => setPayoutAmount("") })}>Request payout</Button></div></div>{payoutMutation.isError && <p role="alert" className="mt-3 text-sm text-red-600">Couldn’t request the payout. Check the amount and Connect account status, then try again.</p>}</div>}
                {settlements.settlements?.map((settlement) => <div key={settlement.id} className="bg-white border border-gray-100 rounded-xl px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-gray-900">Settlement {settlement.sellerOrderId}</p><p className="text-xs text-gray-500 mt-1">{settlement.transfer?.stripeTransferId ? `Transfer ${settlement.transfer.stripeTransferId}` : "Transfer pending"}</p></div><span className="text-xs font-medium rounded bg-gray-50 text-gray-600 px-2 py-1">{settlement.status}</span></div><div className="grid grid-cols-2 gap-3 mt-4 text-xs md:grid-cols-4"><div><p className="text-gray-500">Net due</p><p className="text-sm text-gray-900 mt-1">₹{(settlement.netAmountMinor / 100).toLocaleString("en-IN")}</p></div><div><p className="text-gray-500">Transferred</p><p className="text-sm text-gray-900 mt-1">₹{(settlement.transferredAmountMinor / 100).toLocaleString("en-IN")}</p></div><div><p className="text-gray-500">Refunds</p><p className="text-sm text-gray-900 mt-1">₹{(settlement.refundAmountMinor / 100).toLocaleString("en-IN")}</p></div><div><p className="text-gray-500">Remaining</p><p className="text-sm text-gray-900 mt-1">₹{(settlement.outstandingAmountMinor / 100).toLocaleString("en-IN")}</p></div></div></div>)}
                {settlements.sellerOrders.slice(0, 3).map((settlement) => (
                  <div key={settlement.id} className="bg-white border border-gray-100 rounded-xl px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-gray-900">Order {settlement.orderId}</p><p className="text-xs text-gray-500 mt-1">{new Date(settlement.createdAt).toLocaleDateString("en-IN")}</p></div><span className="text-xs font-medium rounded bg-gray-50 text-gray-600 px-2 py-1">{settlement.status}</span></div>
                    <div className="grid grid-cols-3 gap-3 mt-4 text-xs"><div><p className="text-gray-500">Artwork gross</p><p className="text-sm text-gray-900 mt-1">₹{(settlement.grossArtworkAmountMinor / 100).toLocaleString("en-IN")}</p></div><div><p className="text-gray-500">Platform fee</p><p className="text-sm text-gray-900 mt-1">₹{(settlement.platformFeeAmountMinor / 100).toLocaleString("en-IN")}</p></div><div><p className="text-gray-500">Allocated net</p><p className="text-sm text-gray-900 mt-1">₹{(settlement.netAllocatedAmountMinor / 100).toLocaleString("en-IN")}</p></div></div>
                  </div>
                ))}
                {settlements.payouts.slice(0, 3).map((payout) => <div key={payout.id} className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-gray-900">Stripe payout</p><p className="text-xs text-gray-500 mt-1">{payout.paidAt ? `Paid ${new Date(payout.paidAt).toLocaleDateString("en-IN")}` : "Awaiting payout confirmation"}</p></div><div className="text-right"><p className="text-sm text-gray-900">₹{(payout.amountMinor / 100).toLocaleString("en-IN")}</p><p className="text-xs text-gray-500 mt-1">{payout.status}</p></div></div>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Artworks Tab ──────────────────────────────────────────── */}
      {tab === "artworks" && (
        <div id="artist-panel-artworks" role="tabpanel" aria-labelledby="artist-tab-artworks" tabIndex={0}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">Manage your published artworks</p>
            <Button variant="primary" size="sm" onClick={openArtworkCreator}>Add artwork</Button>
          </div>
          {artworkEditor !== false && (artworkEditor === null ? <ArtistSubmissionForm onSubmitted={() => { setArtworkEditor(false); void refetchProducts(); }} onCancel={() => setArtworkEditor(false)} /> : <ArtworkForm product={artworkEditor} onSaved={() => { setArtworkEditor(false); void refetchProducts(); }} onCancel={() => setArtworkEditor(false)} />)}
          {archiveError && <p role="alert" className="text-sm text-red-600 mb-4">{archiveError}</p>}
          {productsLoading ? (
            <p className="py-12 text-center text-sm text-gray-500">Loading your published artworks…</p>
          ) : isProductsError ? (
            <div className="py-12 text-center"><p className="text-sm text-gray-500 mb-3">We couldn’t load your artworks.</p><Button variant="secondary" size="sm" onClick={() => refetchProducts()}>Try Again</Button></div>
          ) : artistProducts.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No published artworks yet.</p>
          ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {artistProducts.map((p) => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gray-100">
                  <Image src={p.image} alt={p.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-heading font-medium text-gray-900 line-clamp-1">{p.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">₹{p.price.toLocaleString()}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => setArtworkEditor(p)}>Edit</Button>
                    <button type="button" onClick={() => void archiveArtwork(p)} disabled={productMutations.archive.isPending} aria-label={`Archive ${p.title}`} className="inline-flex min-h-11 min-w-11 items-center justify-center px-4 py-2 text-[13px] rounded-lg font-medium bg-transparent text-gray-500 border-none cursor-pointer hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {tab === "collections" && (
        <div id="artist-panel-collections" role="tabpanel" aria-labelledby="artist-tab-collections" tabIndex={0}>
          <p className="mb-5 text-sm text-gray-500">Curate collections from your own artworks</p>
          <ArtistCollectionManager products={artistProducts} />
        </div>
      )}

      {/* ── Orders Tab ────────────────────────────────────────────── */}
      {tab === "orders" && (
        <div id="artist-panel-orders" role="tabpanel" aria-labelledby="artist-tab-orders" tabIndex={0}>
          <p className="text-sm text-gray-500 mb-5">Track and manage incoming orders</p>
          {isAuthPending || isSellerOrdersPending ? <p className="py-12 text-center text-sm text-gray-500">Loading incoming orders…</p> : isSellerOrdersError ? (
            <div className="py-12 text-center"><p className="text-sm text-gray-500 mb-3">We couldn’t load incoming orders.</p><Button variant="secondary" size="sm" onClick={() => refetchSellerOrders()}>Try Again</Button></div>
          ) : sellerOrders.length === 0 ? <div className="bg-white border border-gray-100 rounded-xl px-5 py-10 text-center"><p className="text-sm text-gray-500">No incoming orders yet.</p><p className="text-xs text-gray-500 mt-1">Orders for your published artworks will appear here.</p></div> : (
            <div className="space-y-4">
              {sellerOrderStatusMutation.isError && <p role="alert" className="text-sm text-red-600">Couldn’t update fulfillment status. Try again.</p>}
              {sellerOrders.map((order) => <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-5"><div className="flex flex-wrap justify-between gap-2 mb-4"><div><p className="text-sm font-medium text-gray-900">Order {order.id}</p><p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p></div><div className="flex items-center gap-2"><span className={`text-xs font-medium rounded px-2 py-1 ${order.lateAt ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-600"}`}>{order.lateAt ? "LATE" : order.status}</span>{order.processingDueAt && <span className="text-xs text-gray-500">Due {new Date(order.processingDueAt).toLocaleDateString("en-IN")}</span>}</div></div><div className="space-y-3">{order.items.map((item) => <div key={item.id} className="rounded-lg border border-gray-100 p-3"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative">{item.product.images[0]?.url && <Image src={item.product.images[0].url} alt="" fill className="object-cover" sizes="48px" />}</div><div className="min-w-0 flex-1"><p className="text-sm text-gray-900 truncate">{item.product.title}</p><p className="text-xs text-gray-500">Qty {item.quantity} · {item.size}</p></div><select aria-label={`Fulfillment status for ${item.product.title}`} className="min-h-11 border border-gray-200 rounded-lg px-2 text-xs text-gray-700" value={item.fulfillmentStatus} disabled={sellerOrderStatusMutation.isPending} onChange={(event) => sellerOrderStatusMutation.mutate({ itemId: item.id, status: event.target.value as typeof item.fulfillmentStatus })}><option value="PENDING" disabled>Pending</option><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="IN_TRANSIT">In transit</option><option value="DELIVERED">Delivered</option></select><span className="text-sm text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span></div>{item.product.artworkDetails?.fulfillmentMode === "DIGITAL" && <div className="mt-3 border-t border-gray-100 pt-3"><p className="text-xs font-medium text-gray-700">Digital delivery</p>{digitalDeliveryItemId === item.id ? <div className="mt-2 flex flex-wrap gap-2"><input aria-label="Digital asset reference" value={digitalAssetReference} onChange={(event) => setDigitalAssetReference(event.target.value)} placeholder="Storage object key or HTTPS URL" className="min-h-10 min-w-[220px] flex-1 rounded-lg border border-gray-200 px-3 text-xs" /><input aria-label="Download limit" type="number" min="1" max="20" value={digitalDownloadLimit} onChange={(event) => setDigitalDownloadLimit(event.target.value)} className="min-h-10 w-20 rounded-lg border border-gray-200 px-2 text-xs" /><Button size="sm" loading={digitalDeliveryMutation.isPending} disabled={!digitalAssetReference.trim()} onClick={() => digitalDeliveryMutation.mutate({ itemId: item.id, assetReference: digitalAssetReference.trim(), downloadLimit: Number(digitalDownloadLimit) }, { onSuccess: () => { setDigitalDeliveryItemId(null); setDigitalAssetReference(""); } })}>Publish</Button><Button size="sm" variant="ghost" onClick={() => setDigitalDeliveryItemId(null)}>Cancel</Button></div> : <Button size="sm" variant="secondary" className="mt-2" onClick={() => setDigitalDeliveryItemId(item.id)}>Publish download</Button>}</div>}</div>)}</div><p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">Ship to: {order.shippingAddress}</p></div>)}
            </div>
          )}
        </div>
      )}

      {/* ── Analytics Tab ─────────────────────────────────────────── */}
      {tab === "analytics" && (
        <div id="artist-panel-analytics" role="tabpanel" aria-labelledby="artist-tab-analytics" tabIndex={0} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Published artworks" value={String(artistProducts.length)} icon="M4 6h16M4 12h16M4 18h16" />
            <StatCard label="Gross order value" value={`₹${grossSales.toLocaleString("en-IN")}`} icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            <StatCard label="Delivered reviews" value={String(sellerReviews.length)} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2" />
            <StatCard label="Followers" value={artist?.followers ?? "—"} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" />
          </div>
          <div className="hidden grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Analytics unavailable" value="—" icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <StatCard label="Analytics unavailable" value="—" icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            <StatCard label="Analytics unavailable" value="—" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="Analytics unavailable" value="—" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-heading text-base font-semibold text-gray-900 mb-4">Analytics</h3>
            <p className="text-sm text-gray-500">These figures reflect the persisted listings, orders, delivered reviews, and follower record currently available to your workspace.</p>
          </div>
        </div>
      )}

      {/* ── Reviews Tab ───────────────────────────────────────────── */}
      {tab === "reviews" && (
        <div id="artist-panel-reviews" role="tabpanel" aria-labelledby="artist-tab-reviews" tabIndex={0}>
          <p className="text-sm text-gray-500 mb-5">Customer feedback on your artworks</p>
          {isAuthPending || isSellerReviewsPending ? <p className="py-12 text-center text-sm text-gray-500">Loading artwork reviews…</p> : isSellerReviewsError ? <div className="py-12 text-center"><p className="text-sm text-gray-500 mb-3">We couldn’t load artwork reviews.</p><Button variant="secondary" size="sm" onClick={() => refetchSellerReviews()}>Try Again</Button></div> : sellerReviews.length === 0 ? <div className="bg-white border border-gray-100 rounded-xl px-5 py-8 text-center"><p className="text-sm text-gray-500">No reviews on your artwork yet.</p><p className="text-xs text-gray-500 mt-1">Persisted customer reviews will appear here.</p></div> : <div className="space-y-4">{sellerReviews.map((review) => <article key={review.id} className="bg-white border border-gray-100 rounded-xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium text-gray-900">{review.product.title}</p><p className="text-xs text-gray-500 mt-1">{review.user.firstName} {review.user.lastName} · {new Date(review.createdAt).toLocaleDateString("en-IN")}</p></div><span className="text-sm text-gray-700" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(Math.round(review.rating))}{"☆".repeat(5 - Math.round(review.rating))}</span></div><p className="text-sm text-gray-600 mt-4">{review.text}</p>{review.verified && <p className="text-xs text-gray-500 mt-3">Verified delivered purchase</p>}</article>)}</div>}
          <div className="hidden space-y-4">
            {[
              { name: "Priya S.", rating: 5, text: "Absolutely stunning piece. The colors are even more vibrant in person. Will definitely buy again!", date: "2 days ago" },
              { name: "Rahul M.", rating: 4, text: "Great quality print and fast shipping. Framing was slightly delayed but overall very happy.", date: "5 days ago" },
              { name: "Anita K.", rating: 5, text: "This ceramic vase is a masterpiece. The glaze work is incredible and it looks perfect in my living room.", date: "1 week ago" },
            ].map((r, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-[#111]">{r.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className={`w-3.5 h-3.5 ${j < r.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Settings Tab ──────────────────────────────────────────── */}
      {tab === "settings" && (
        <div id="artist-panel-settings" role="tabpanel" aria-labelledby="artist-tab-settings" tabIndex={0}>
          {currentUser ? <ArtistProfileSettings key={`${currentUser.id}-${artist?.handle ?? ""}-${artist?.bio ?? ""}`} currentUser={currentUser} artist={artist} /> : null}
        </div>
      )}
    </div>
  );
}
