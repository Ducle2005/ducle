export function getErrorMessage(error: unknown, fallback = "Đã xảy ra lỗi") {
  if (error instanceof Error && error.message) {
    if (error.message.includes("Failed to fetch")) {
      return "Không thể kết nối đến máy chủ. Vui lòng thử lại sau ít phút.";
    }

    if (error.message.includes("NetworkError")) {
      return "Lỗi mạng. Vui lòng kiểm tra kết nối internet.";
    }

    return error.message;
  }

  return fallback;
}
