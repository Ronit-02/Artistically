import CollectionDetailClient from "./CollectionDetailClient";

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CollectionDetailClient collectionId={parseInt(id, 10)} />;
}
