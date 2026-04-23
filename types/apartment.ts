import type { paths } from "@/types/api"

export type ApartmentListResponse = paths["/api/v1/apartments/search"]["get"]["responses"]["200"]["content"]["application/json"];
export type ApartmentDetailResponse = paths["/api/v1/apartments/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type ApartmentSearchQueryParams = paths["/api/v1/apartments/search"]["get"]["parameters"]["query"]

export type ApartmentItem = NonNullable<ApartmentListResponse['data']>[number]
export type ApartmenList = ApartmentItem[]
export type ApartmentQueryParams = NonNullable<ApartmentSearchQueryParams>
export type FurnishingType = NonNullable<ApartmentQueryParams['furnishingStatus']>

export type ApartmentFilterPatch = {
    keyword?: ApartmentQueryParams['keyword']
    minBedrooms?: ApartmentQueryParams['minBedrooms']
    maxBedrooms?: ApartmentQueryParams['maxBedrooms']
    minPrice?: ApartmentQueryParams['minPrice']
    maxPrice?: ApartmentQueryParams['maxPrice']
    minArea?: ApartmentQueryParams['minArea']
    maxArea?: ApartmentQueryParams['maxArea']
    furnishingStatus?: ApartmentQueryParams['furnishingStatus']
    // Keep fallback while BE/OpenAPI has not synced wardCode yet.
    wardCode?: number
}

export type ApartmentHeaderProps = {
    apartmentTitle: string
    address: string
    statusLabel: string
    statusBackgroundColor: string
    statusTextColor: string
    isPrimaryTenant: boolean
    apartmentImages?: (string | null | undefined)[]
}

export type ChangeHousePasswordModalProps = {
    visible: boolean
    oldHousePassword: string
    newHousePassword: string
    confirmNewHousePassword: string
    isUpdating: boolean
    isFirstPassSetup?: boolean
    helperText?: string
    passwordLength?: number
    onChangeOldPassword: (value: string) => void
    onChangeNewPassword: (value: string) => void
    onChangeConfirmPassword: (value: string) => void
    onClose: () => void
    onSubmit: () => void
}
