export const DOOR_PASSWORD_LENGTH = 6
export const MAX_DOOR_PASSWORD_FAILED_ATTEMPTS = 3
export const DOOR_PASSWORD_LOCK_SECONDS = 30

export const sanitizeDoorPassword = (value: string) =>
     value.replace(/\D/g, "").slice(0, DOOR_PASSWORD_LENGTH)

export const isValidDoorPassword = (value: string) =>
     new RegExp(`^\\d{${DOOR_PASSWORD_LENGTH}}$`).test(value)
