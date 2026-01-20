import * as XLSX from "xlsx";

interface Guest {
  id: string;
  name: string;
  dietary_restrictions: string | null;
  plus_one: boolean;
  plus_one_name: string | null;
  rsvp_status: "pending" | "confirmed" | "declined";
  notes: string | null;
}

export function exportGuestsToExcel(guests: Guest[]) {
  const statusLabels = {
    pending: "Väntar",
    confirmed: "Bekräftat",
    declined: "Avböjt",
  };

  const data = guests.map((guest) => ({
    Namn: guest.name,
    Status: statusLabels[guest.rsvp_status],
    "Har +1": guest.plus_one ? "Ja" : "Nej",
    "+1 Namn": guest.plus_one_name || "",
    "Allergier/Kost": guest.dietary_restrictions || "",
    Anteckningar: guest.notes || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Gästlista");

  // Auto-size columns
  const maxWidths = [
    { wch: 25 }, // Namn
    { wch: 12 }, // Status
    { wch: 8 },  // Har +1
    { wch: 25 }, // +1 Namn
    { wch: 25 }, // Allergier
    { wch: 30 }, // Anteckningar
  ];
  worksheet["!cols"] = maxWidths;

  // Generate filename with date
  const date = new Date().toISOString().split("T")[0];
  const filename = `gastlista-${date}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
