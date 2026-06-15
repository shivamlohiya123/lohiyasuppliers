export function UserRoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    CUSTOMER: "bg-blue-100 text-blue-700",
    B2B_PARTNER: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[role] || "bg-gray-100 text-gray-700"}`}>
      {role.replace("_", " ")}
    </span>
  );
}
