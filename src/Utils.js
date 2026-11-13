export const formatTime = (iso) => {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const formatMoney = (amount) => `€${Number(amount).toFixed(2)}`
export const formatDate = (iso) => new Date(iso).toLocaleDateString();

