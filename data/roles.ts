

export type UserRole =
  | "admin"
  | "vendedor"
  | "minorista"
  | "mayorista"
  | "instalador"
  | "distribuidor";

export const internalRoles: UserRole[] = ["admin", "vendedor"];

export const customerRoles: UserRole[] = [
  "minorista",
  "mayorista",
  "instalador",
  "distribuidor",
];

export const wholesaleRoles: UserRole[] = [
  "mayorista",
  "instalador",
  "distribuidor",
];

export function isInternalUser(role: UserRole) {
  return internalRoles.includes(role);
}

export function isCustomer(role: UserRole) {
  return customerRoles.includes(role);
}

export function canSeeWholesalePrice(role: UserRole) {
  return wholesaleRoles.includes(role);
}

export function canAccessAdmin(role: UserRole) {
  return role === "admin";
}

export function canManageOrders(role: UserRole) {
  return role === "admin" || role === "vendedor";
}

export function canViewInternalStock(role: UserRole) {
  return role === "admin" || role === "vendedor";
}

export function canBuy(role: UserRole) {
  return (
    role === "minorista" ||
    role === "mayorista" ||
    role === "instalador" ||
    role === "distribuidor"
  );
}
export function canManageUsers(role: UserRole) {
  return role === "admin";
}