import { paths } from "./api";

export type UserDetail = NonNullable<paths["/api/v1/users/{id}"]['get']['responses']['200']['content']['application/json']['data']>

export type UpdateUserDto = Partial<
    paths["/api/v1/users/{id}"]["patch"]["requestBody"]["content"]["application/json"]
>

export type UpdateUserResponse = NonNullable<
    paths["/api/v1/users/{id}"]["patch"]["responses"]["200"]["content"]["application/json"]["data"]
>

export type UserProfileEditableValues = {
    fullName: string
    phone: string
    emergencyContactName: string
    emergencyContactPhone: string
}

export type ProfileHeaderProps = {
    name: string;
    email: string;
    avatar: string | null;
    isVerified?: boolean;
    avatarUploading?: boolean;
    onAvatarChange?: (uri: string) => Promise<void> | void;
}

export type ProfileDetailsProps = {
    onBack: () => void;
    user: UserDetail | null;
    onSave: (values: UserProfileEditableValues) => Promise<void>;
    saving: boolean;
}

export type UserIdentityField = {
    key: string;
    label: string;
    value: unknown;
}

export type ProfileInfoRowProps = {
    label: string;
    value: string;
}

export type ProfileEditableInputProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: "default" | "phone-pad";
}

export type MenuItemData = {
  id: string;
  label: string;
  icon: string;
  screen: string;
}