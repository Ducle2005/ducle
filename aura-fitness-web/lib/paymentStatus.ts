/** A polling error must never invoke apiFetch's global logout handler. */
export async function checkPaymentStatus(apiBaseUrl: string): Promise<boolean> {
  const token = localStorage.getItem("auth-token");
  if (!token) throw new Error("Vui lòng đăng nhập lại để kiểm tra giao dịch.");
  const response = await fetch(`${apiBaseUrl}/payment/check-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Chưa thể kiểm tra giao dịch. Vui lòng thử lại sau.");
  const status: { isPremium?: boolean } = await response.json();
  return status.isPremium === true;
}
