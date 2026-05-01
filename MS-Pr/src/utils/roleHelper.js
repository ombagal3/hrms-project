export const getRoleFromEmail = (email) => {
  if (email.startsWith("emp")) return "employee";
  if (email.startsWith("mgr")) return "manager";
  if (email.startsWith("admin")) return "admin";
  return "employee";
};