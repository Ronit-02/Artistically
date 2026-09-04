import type { OrderItem } from "@/types";
import type { ArtistSettlementDto, OrderDto, SellerOrderDto } from "@/types/api";
import { apiRequest, ApiClientError } from "@/lib/api/client";
import { fromMinorUnits } from "@/lib/money";

const statusMap: Record<string, OrderItem["status"]> = {
  PROCESSING: "processing",
  CONFIRMED: "processing",
  SHIPPED: "in-transit",
  IN_TRANSIT: "in-transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "cancelled",
};

export function mapOrdersToItems(orders: OrderDto[]): OrderItem[] {
  return orders.flatMap((order) => order.items.map((item) => {
    const artist = `${item.product.artist.user.firstName} ${item.product.artist.user.lastName}`.trim();
    const itemStatus = item.fulfillmentStatus ? statusMap[item.fulfillmentStatus] : undefined;
    return {
      id: item.id,
      orderId: order.id,
      title: item.product.title,
      artist,
      price: fromMinorUnits(item.price * item.quantity),
      originalPrice: null,
      discount: null,
      image: item.product.images[0]?.url ?? "/paintings/painting-1.jpg",
      size: item.size,
      status: itemStatus ?? statusMap[order.status],
      date: new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    };
  }));
}

export async function fetchOrderItems(): Promise<OrderItem[]> {
  const orders = await apiRequest<OrderDto[]>("/api/orders");
  return mapOrdersToItems(orders);
}

export async function fetchOrderById(orderId: string): Promise<OrderDto | null> {
  try {
    const order = await apiRequest<OrderDto>(`/api/orders/${encodeURIComponent(orderId)}`);
    return mapOrderMoney(order);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

function mapOrderMoney(order: OrderDto): OrderDto {
  return {
    ...order,
    subtotal: fromMinorUnits(order.subtotal),
    shippingCost: fromMinorUnits(order.shippingCost),
    tax: fromMinorUnits(order.tax),
    discount: fromMinorUnits(order.discount),
    total: fromMinorUnits(order.total),
    items: order.items.map((item) => ({ ...item, price: fromMinorUnits(item.price) })),
  };
}

export async function cancelOrder(orderId: string): Promise<void> {
  await apiRequest<never>(`/api/orders/${encodeURIComponent(orderId)}`, { method: "DELETE" });
}

export async function fetchSellerOrders(): Promise<SellerOrderDto[]> {
  const orders = await apiRequest<SellerOrderDto[]>("/api/artist/orders");
  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item, price: fromMinorUnits(item.price) })),
  }));
}

export async function fetchArtistSettlements(): Promise<ArtistSettlementDto> {
  return apiRequest<ArtistSettlementDto>("/api/artist/settlements");
}

export async function createArtistPayout(amountMinor: number, idempotencyKey: string) {
  return apiRequest("/api/artist/payouts", {
    method: "POST",
    body: JSON.stringify({ amountMinor, idempotencyKey }),
  });
}

export async function updateSellerOrderItemStatus(itemId: string, status: SellerOrderDto["items"][number]["fulfillmentStatus"]): Promise<void> {
  await apiRequest(`/api/artist/order-items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function publishDigitalDelivery(orderItemId: string, assetReference: string, downloadLimit = 3) {
  return apiRequest(`/api/artist/order-items/${encodeURIComponent(orderItemId)}/digital-delivery`, {
    method: "POST",
    body: JSON.stringify({ assetReference, downloadLimit }),
  });
}
