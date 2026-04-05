import { Outlet } from "react-router-dom";
import { CsvImportProvider } from "@/pages/owner/csv/CsvImportContext";

export function CsvImportLayout() {
  return (
    <CsvImportProvider>
      <Outlet />
    </CsvImportProvider>
  );
}
