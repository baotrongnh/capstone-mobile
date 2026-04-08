const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX || "";

export const createEndpoints = (resource: string) => {
  return `${API_PREFIX}/${resource}`;
};

export const endpoints = {
  apartments: createEndpoints("apartments"),
  viewRequest: createEndpoints("viewing-requests"),
  apartmentPolicies: createEndpoints("apartment-policies/apartment"),
  contracts: createEndpoints("contracts"),
  auth: createEndpoints("auth"),
  users: createEndpoints("users"),
  partners: createEndpoints("partners"),
  reservations: createEndpoints("reservations"),
  invoices: createEndpoints("invoices"),
  notifications: createEndpoints("notifications"),
  iot: createEndpoints("iot"),
  userApartments: createEndpoints("user-apartments"),
  myApartment: createEndpoints("user-apartments/my"),
  maintenance: createEndpoints("maintenance"),
};
