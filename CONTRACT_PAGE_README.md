# Mobile Contract Page Documentation

## Tổng Quan

Trang Hợp đồng (Contract) cho mobile app đã được tạo hoàn chỉnh với tất cả chức năng tương tự như web version. Bao gồm:

- ✅ Danh sách hợp đồng với filter theo trạng thái
- ✅ Hiển thị thông tin chi tiết hợp đồng
- ✅ Ký điện tử hợp đồng
- ✅ Hủy hợp đồng
- ✅ Gia hạn hợp đồng
- ✅ Thêm thành viên vào hợp đồng
- ✅ Tải xuống file PDF
- ✅ Xem PDF trực tuyến

## Cấu Trúc File

```
capstone-mobile/
├── app/(tabs)/
│   └── contract.tsx                          # Main contract page
├── components/contract/
│   ├── ContractCard.tsx                      # Card component hiển thị hợp đồng
│   ├── ViewContractModal.tsx                 # Modal xem & ký hợp đồng
│   ├── CancelContractModal.tsx               # Modal hủy hợp đồng
│   ├── ExtendContractModal.tsx               # Modal gia hạn hợp đồng
│   └── AddMemberModal.tsx                    # Modal thêm thành viên
├── hooks/query/
│   └── useContracts.ts                       # React Query hooks
├── lib/services/
│   └── contract.service.ts                   # API service
└── types/
    └── contract.ts                           # Type definitions
```

## Components

### 1. ContractCard Component

**File:** `components/contract/ContractCard.tsx`

Card component hiển thị thông tin tóm tắt của hợp đồng:

- Mã hợp đồng
- Trạng thái (draft, signed, active, terminated, renewal)
- Người thuê
- Căn hộ
- Địa chỉ
- Khoảng thời gian hợp đồng
- Số thành viên
- Giá thuê/tháng
- Nút hành động

**Props:**

```typescript
interface ContractCardProps {
  contract: ContractWithMembers;
  onViewPress: () => void;
  onCancelPress: () => void;
  onExtendPress: () => void;
  onDownloadPress: () => void;
  onAddMemberPress: () => void;
}
```

### 2. ViewContractModal Component

**File:** `components/contract/ViewContractModal.tsx`

Modal cho phép người dùng:

- Xem thông tin chi tiết hợp đồng
- Xem file PDF
- Ký điện tử hợp đồng (nếu trạng thái là draft)
- Tải xuống file PDF

**Features:**

- Hiển thị PDF inline
- Checkbox đồng ý điều khoản
- Loading state khi gửi hợp đồng

### 3. CancelContractModal Component

**File:** `components/contract/CancelContractModal.tsx`

Modal để hủy hợp đồng:

- Chọn lý do hủy từ dropdown
- Hiển thị mã hợp đồng và căn hộ
- Warning box cảnh báo về thao tác

**Lý do hủy:**

- Người thuê yêu cầu hủy
- Chủ nhà yêu cầu hủy
- Vi phạm điều khoản hợp đồng
- Không thanh toán đầy đủ
- Thỏa thuận chung
- Lý do khác

### 4. ExtendContractModal Component

**File:** `components/contract/ExtendContractModal.tsx`

Modal để gia hạn hợp đồng:

- Chọn số tháng gia hạn (1-12 tháng)
- Xem ngày kết thúc hiện tại
- Xem preview ngày kết thúc mới
- Nhập điều kiện đặc biệt (tùy chọn)

### 5. AddMemberModal Component

**File:** `components/contract/AddMemberModal.tsx`

Modal để thêm thành viên vào hợp đồng:

- Nhập CCCD 12 số
- Hiển thị danh sách thành viên đã chọn
- Xóa thành viên khỏi danh sách
- Gửi yêu cầu thêm thành viên

## Services & Hooks

### Contract Service

**File:** `lib/services/contract.service.ts`

API methods:

```typescript
contractsService.getList(); // Lấy danh sách hợp đồng
contractsService.uploadPdf(); // Upload PDF khi ký
contractsService.cancel(); // Hủy hợp đồng
contractsService.renew(); // Gia hạn hợp đồng
contractsService.addMember(); // Thêm thành viên
```

### Contract Hooks

**File:** `hooks/query/useContracts.ts`

Hooks sử dụng TanStack Query:

```typescript
useContracts(); // Lấy danh sách & loading state
useUploadContractPdf(); // Upload PDF đã ký
useCancelContract(); // Hủy hợp đồng
useRenewContract(); // Gia hạn hợp đồng
useAddMemberContract(); // Thêm thành viên
```

## Types

**File:** `types/contract.ts`

```typescript
interface ContractWithMembers {
  id: string;
  contractNumber: string;
  status: "draft" | "signed" | "active" | "terminated";
  category?: "renewal" | "normal";
  startDate: string;
  endDate: string;
  monthlyRent: string | number;
  isDepositPaid: boolean;
  isRenewed: boolean;
  hasPdf: boolean;
  pdfUrl: string;
  apartment: {
    id: string;
    apartmentNumber: string;
    address: string;
    city: string;
    newAddress: Address;
    streetAddress: string;
  };
  members: ContractMember[];
}
```

## Pages

### Main Contract Page

**File:** `app/(tabs)/contract.tsx`

Trang chính quản lý hợp đồng:

**Features:**

- Danh sách tất cả hợp đồng
- Filter by status (all, draft, signed, active, renewal, terminated)
- Thống kê (tổng hợp đồng, đang hoạt động, chờ xử lý)
- Pull-to-refresh
- Empty states
- Loading states

**State Management:**

- `statusFilter`: bộ lọc hiện tại
- `selectedContract`: hợp đồng được chọn
- `showViewModal`, `showCancelModal`, `showExtendModal`, `showAddMemberModal`: trạng thái hiển thị modals

**Key Functions:**

- `handleViewContract()`: mở modal xem
- `handleDownloadContract()`: tải PDF
- `handleCancelContract()`: mở modal hủy
- `handleExtendContract()`: mở modal gia hạn
- `handleAddMember()`: mở modal thêm thành viên

## Styling

Tất cả components sử dụng React Native StyleSheet với các màu:

- Primary: `#2196f3` (Blue)
- Success: `#4caf50` (Green)
- Danger: `#f44336` (Red)
- Warning: `#ff9800` (Orange)
- Background: `#fafafa` (Light gray)

## Dependencies

Các packages được cài đặt:

- `@react-native-picker/picker`: Picker component cho chọn lý do, số tháng, v.v.
- `expo-file-system`: Tải xuống file PDF
- `expo-sharing`: Chia sẻ file PDF
- `expo-web-browser`: Mở PDF trong browser
- Các dependencies hiện có: react-query, axios, react-native, v.v.

## Environment Variables

Đảm bảo các biến môi trường được cấu hình:

```
EXPO_PUBLIC_API_BASE_URL=<your-api-url>
EXPO_PUBLIC_API_PREFIX=<your-api-prefix>
```

## Cách Sử Dụng

### Tinh chỉnh cho từng trường hợp

1. **Nếu muốn tùy chỉnh Picker dialog:**
   - Chỉnh sửa trong `CancelContractModal`, `ExtendContractModal`

2. **Nếu muốn thêm signature pad:**
   - Cài `react-native-signature-canvas` hoặc tương tự
   - Thay thế logic trong `ViewContractModal`'s `handleSignAndSend`

3. **Nếu muốn search user khi thêm member:**
   - Tạo hook `useSearchNational` (tương tự web)
   - Cập nhật `AddMemberModal` để gọi API search

## Notes

- Status mapping được định nghĩa trong `types/contract.ts`
- Tất cả error messages hiển thị via `Alert.alert()`
- Loading states hiển thị via `ActivityIndicator`
- PDF download sử dụng `expo-file-system` và `expo-sharing`
