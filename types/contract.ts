import type { paths, components } from "@/types/api";

export type ContractListResponse =
  paths["/api/v1/contracts"]["get"]["responses"]["200"]["content"]["application/json"];
export type ContractItem = NonNullable<ContractListResponse["data"]>["items"][number];
export type ContractList = ContractItem[];

export interface Address {
  wardCode: number;
  wardName: string;
  districtCode: number | null;
  districtName: string | null;
  provinceCode: number;
  provinceName: string;
  fullAddress: string;
}

export type ContractWithMembers = Omit<
  components["schemas"]["ContractListItemDto"],
  "apartment"
> & {
  apartment: {
    id: string;
    apartmentNumber: string;
    address: string;
    city: string;
    newAddress: Address;
    streetAddress: string;
  };
  members: components["schemas"]["ContractMemberDto"][];
  hasPdf?: boolean;
  pdfUrl?: string;
  depositAmount?: string;
  depositPaidAt?: string | null;
  isDepositPaid?: boolean;
  category?: string;
  terminationReason?: string;
};

export type ContractStatus =
  | "draft"
  | "active"
  | "signed"
  | "terminated"
  | "renewal";

export const CONTRACT_STATUS_MAP: Record<
  ContractStatus,
  { label: string; color: string }
> = {
  draft: { label: "Chưa ký", color: "#ff9800" },
  signed: { label: "Đã ký", color: "#2196f3" },
  active: { label: "Đang hoạt động", color: "#4caf50" },
  terminated: { label: "Đã hủy", color: "#f44336" },
  renewal: { label: "Gia hạn", color: "#009688" },
};
