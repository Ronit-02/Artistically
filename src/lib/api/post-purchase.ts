import type { OrderDto } from "@/types/api";
import { apiRequest } from "@/lib/api/client";

export type DigitalDownloadDto = {
  id: string;
  status: string;
  downloadCount: number;
  downloadLimit: number;
  expiresAt: string | null;
  downloadUrl: string;
};

export type DisputeDto = NonNullable<OrderDto["disputes"]>[number];
export type DeliveryRecordDto = NonNullable<OrderDto["deliveryRecords"]>[number];

export function prepareDigitalDownload(orderId: string, orderItemId: string) {
  return apiRequest<DigitalDownloadDto>(`/api/orders/${encodeURIComponent(orderId)}/digital-delivery/${encodeURIComponent(orderItemId)}`, {
    method: "POST",
    body: JSON.stringify({ acceptLicense: true }),
  });
}

export function createOrderDispute(orderId: string, input: { type: string; reason: string; orderItemId?: string }) {
  return apiRequest<DisputeDto>(`/api/orders/${encodeURIComponent(orderId)}/disputes`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchOrderDeliveryRecords(orderId: string) {
  return apiRequest<DeliveryRecordDto[]>(`/api/orders/${encodeURIComponent(orderId)}/delivery-records`);
}

export function fetchOrderDisputes(orderId: string) {
  return apiRequest<DisputeDto[]>(`/api/orders/${encodeURIComponent(orderId)}/disputes`);
}
