export const getErrorMessage = (error) => {

  if (error.response) {
    const detail = error.response.data.detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) => typeof item === "string" ? item : item?.msg)
        .filter(Boolean)
        .join(" / ") || "入力内容を確認してください";
    }

    return (
      (typeof detail === "string" && detail) ||
      "サーバーエラー"
    );
  }

  if (error.request) {
    return "サーバーに接続できません";
  }

  return "エラーが発生しました";
};
