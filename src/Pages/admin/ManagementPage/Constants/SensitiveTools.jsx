import React from "react";
import BackButton from "../../../../Layouts/Buttons/BackButton.jsx";

function SensitiveTools() {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <BackButton className="mb-2" label="Back to Management" />
          <h1 className="text-2xl font-semibold text-gray-900">A Tool</h1>
          <p className="text-sm text-gray-600 mt-1">
            Access tools for critical operations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SensitiveTools;

// import React, { useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import { api } from "../../../../Library/RequestMaker";
// import { endpoints } from "../../../../Library/Endpoints";
// import { useGlobalContext } from "../../../../Hooks/UseContext";
// import InvoiceCodeFilter from "../Invoices2.0/Filters/InvoiceCodeFilter";
// import InvoiceStatusFilter from "../Invoices2.0/Filters/InvoiceStatusFilter";

// function SensitiveTools() {
//   const { billings = [] } = useGlobalContext();

//   const [invoiceIdsInput, setInvoiceIdsInput] = useState("");
//   const [studentGroupIdsInput, setStudentGroupIdsInput] = useState("");
//   const [academicYearIdsInput, setAcademicYearIdsInput] = useState("");
//   const [invoiceYearsInput, setInvoiceYearsInput] = useState("");
//   const [invoiceMonthsInput, setInvoiceMonthsInput] = useState("");
//   const [selectedInvoiceStatuses, setSelectedInvoiceStatuses] = useState([]);
//   const [selectedInvoiceBillingCodes, setSelectedInvoiceBillingCodes] =
//     useState([]);
//   const [invoiceResults, setInvoiceResults] = useState([]);
//   const [invoiceLoading, setInvoiceLoading] = useState(false);
//   const [invoiceError, setInvoiceError] = useState("");
//   const [deletingInvoiceIds, setDeletingInvoiceIds] = useState({});
//   const [bulkDeletingInvoices, setBulkDeletingInvoices] = useState(false);

//   const billingByCode = useMemo(() => {
//     const map = new Map();
//     billings.forEach((b) => {
//       if (b?.code) map.set(b.code, b);
//     });
//     return map;
//   }, [billings]);

//   const billingById = useMemo(() => {
//     const map = new Map();
//     billings.forEach((b) => {
//       if (b?.id) map.set(b.id, b);
//     });
//     return map;
//   }, [billings]);

//   const parseNumberList = (value) =>
//     value
//       .split(",")
//       .map((item) => item.trim())
//       .filter(Boolean)
//       .map((item) => Number(item))
//       .filter((item) => Number.isFinite(item));

//   const buildInvoiceFilters = () => {
//     const ids = parseNumberList(invoiceIdsInput);
//     const studentGroupIds = parseNumberList(studentGroupIdsInput);
//     const academicYearIds = parseNumberList(academicYearIdsInput);
//     const years = parseNumberList(invoiceYearsInput).filter(
//       (year) => year >= 2000 && year <= 2100,
//     );
//     const months = parseNumberList(invoiceMonthsInput).filter(
//       (month) => month >= 1 && month <= 12,
//     );
//     const billingIds = selectedInvoiceBillingCodes
//       .map((code) => billingByCode.get(code)?.id)
//       .filter(Boolean);

//     return {
//       ids: ids.length ? ids : undefined,
//       student_group_ids: studentGroupIds.length ? studentGroupIds : undefined,
//       academic_year_ids: academicYearIds.length ? academicYearIds : undefined,
//       years: years.length ? years : undefined,
//       months: months.length ? months : undefined,
//       billing_ids: billingIds.length ? billingIds : undefined,
//       statuses: selectedInvoiceStatuses.length
//         ? selectedInvoiceStatuses
//         : undefined,
//     };
//   };

//   const extractInvoices = (payload) => {
//     if (Array.isArray(payload)) return payload;
//     if (Array.isArray(payload?.invoices)) return payload.invoices;
//     if (Array.isArray(payload?.items)) return payload.items;
//     if (Array.isArray(payload?.data)) return payload.data;
//     return [];
//   };

//   const loadInvoices = async () => {
//     setInvoiceLoading(true);
//     setInvoiceError("");

//     try {
//       const filters = buildInvoiceFilters();
//       const res = await api.get(endpoints.LIST_INVOICES, filters);
//       const list = extractInvoices(res?.data);
//       setInvoiceResults(list);
//     } catch (err) {
//       setInvoiceError(
//         err?.response?.data?.message || "Failed to load invoices.",
//       );
//     } finally {
//       setInvoiceLoading(false);
//     }
//   };

//   const handleClearInvoiceFilters = () => {
//     setInvoiceIdsInput("");
//     setStudentGroupIdsInput("");
//     setAcademicYearIdsInput("");
//     setInvoiceYearsInput("");
//     setInvoiceMonthsInput("");
//     setSelectedInvoiceStatuses([]);
//     setSelectedInvoiceBillingCodes([]);
//   };

//   const handleDeleteInvoice = async (invoice) => {
//     const id = invoice?.id;
//     if (!id) return;
//     const confirmed = window.confirm(
//       `Delete invoice #${id}? This action cannot be undone.`,
//     );
//     if (!confirmed) return;

//     setDeletingInvoiceIds((prev) => ({ ...prev, [id]: true }));
//     try {
//       await api.delete(endpoints.DELETE_INVOICE(id));
//       setInvoiceResults((prev) => prev.filter((inv) => inv?.id !== id));
//       toast.success("Invoice deleted.");
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to delete invoice.");
//     } finally {
//       setDeletingInvoiceIds((prev) => {
//         const next = { ...prev };
//         delete next[id];
//         return next;
//       });
//     }
//   };

//   const hasInvoiceFilter = (filters) =>
//     Object.values(filters).some((value) =>
//       Array.isArray(value) ? value.length > 0 : Boolean(value),
//     );

//   const handleDeleteFilteredInvoices = async () => {
//     const filters = buildInvoiceFilters();
//     if (!hasInvoiceFilter(filters)) {
//       toast.error("Add at least one filter before bulk delete.");
//       return;
//     }

//     const confirmed = window.confirm(
//       "Delete all invoices that match the current filters?",
//     );
//     if (!confirmed) return;

//     setBulkDeletingInvoices(true);
//     try {
//       await api.delete(endpoints.DELETE_MANY_INVOICES, {
//         data: { filter: filters },
//       });
//       toast.success("Filtered invoices deleted.");
//       loadInvoices();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to delete invoices.");
//     } finally {
//       setBulkDeletingInvoices(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="mx-auto max-w-6xl space-y-6">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">
//             Sensitive Tools
//           </h1>
//           <p className="mt-1 text-sm text-gray-600">
//             Filter and delete invoices with extra care.
//           </p>
//         </div>

//         <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
//               <p className="text-sm text-gray-600">
//                 Filter existing invoices and delete if needed.
//               </p>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               <button
//                 type="button"
//                 onClick={loadInvoices}
//                 className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
//               >
//                 Load invoices
//               </button>
//               <button
//                 type="button"
//                 onClick={handleClearInvoiceFilters}
//                 className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300"
//               >
//                 Clear filters
//               </button>
//               <button
//                 type="button"
//                 onClick={handleDeleteFilteredInvoices}
//                 disabled={bulkDeletingInvoices}
//                 className={`inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-100 ${
//                   bulkDeletingInvoices ? "cursor-not-allowed opacity-70" : ""
//                 }`}
//               >
//                 {bulkDeletingInvoices ? "Deleting..." : "Delete filtered"}
//               </button>
//             </div>
//           </div>

//           <div className="mt-4 grid gap-3 lg:grid-cols-3">
//             <input
//               type="text"
//               value={invoiceIdsInput}
//               onChange={(e) => setInvoiceIdsInput(e.target.value)}
//               placeholder="IDs (e.g. 9001, 9002)"
//               className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <input
//               type="text"
//               value={studentGroupIdsInput}
//               onChange={(e) => setStudentGroupIdsInput(e.target.value)}
//               placeholder="Student group IDs (e.g. 12, 18)"
//               className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <input
//               type="text"
//               value={academicYearIdsInput}
//               onChange={(e) => setAcademicYearIdsInput(e.target.value)}
//               placeholder="Academic year IDs (e.g. 1, 2)"
//               className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <input
//               type="text"
//               value={invoiceYearsInput}
//               onChange={(e) => setInvoiceYearsInput(e.target.value)}
//               placeholder="Years (2000-2100)"
//               className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <input
//               type="text"
//               value={invoiceMonthsInput}
//               onChange={(e) => setInvoiceMonthsInput(e.target.value)}
//               placeholder="Months (1-12)"
//               className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <InvoiceStatusFilter
//               selected={selectedInvoiceStatuses}
//               onChange={setSelectedInvoiceStatuses}
//             />
//             <InvoiceCodeFilter
//               options={billings.map((b) => b?.code).filter(Boolean)}
//               selected={selectedInvoiceBillingCodes}
//               onChange={setSelectedInvoiceBillingCodes}
//             />
//           </div>

//           <div className="mt-4 overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead className="bg-gray-50 text-gray-600">
//                 <tr className="divide-x divide-gray-200">
//                   <th className="px-3 py-2 text-left font-semibold">ID</th>
//                   <th className="px-3 py-2 text-left font-semibold">Year</th>
//                   <th className="px-3 py-2 text-left font-semibold">Month</th>
//                   <th className="px-3 py-2 text-left font-semibold">Status</th>
//                   <th className="px-3 py-2 text-left font-semibold">Billing</th>
//                   <th className="px-3 py-2 text-left font-semibold">Total</th>
//                   <th className="px-3 py-2 text-right font-semibold">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {invoiceLoading && (
//                   <tr>
//                     <td
//                       className="px-3 py-6 text-center text-gray-500"
//                       colSpan={7}
//                     >
//                       Loading invoices...
//                     </td>
//                   </tr>
//                 )}

//                 {invoiceError && !invoiceLoading && (
//                   <tr>
//                     <td
//                       className="px-3 py-6 text-center text-red-600"
//                       colSpan={7}
//                     >
//                       {invoiceError}
//                     </td>
//                   </tr>
//                 )}

//                 {!invoiceLoading &&
//                   !invoiceError &&
//                   invoiceResults.length === 0 && (
//                     <tr>
//                       <td
//                         className="px-3 py-6 text-center text-gray-500"
//                         colSpan={7}
//                       >
//                         No invoices found.
//                       </td>
//                     </tr>
//                   )}

//                 {!invoiceLoading &&
//                   !invoiceError &&
//                   invoiceResults.map((invoice) => {
//                     const billing =
//                       billingById.get(invoice?.billing_id) || invoice?.billing;
//                     const billingLabel =
//                       billing?.code || invoice?.billing_code || "-";
//                     const total =
//                       invoice?.total_required_amount ??
//                       invoice?.subtotal_required_amount ??
//                       "-";
//                     const isDeleting = Boolean(deletingInvoiceIds[invoice?.id]);

//                     return (
//                       <tr
//                         key={invoice?.id}
//                         className="divide-x divide-gray-100"
//                       >
//                         <td className="px-3 py-3 text-gray-900">
//                           {invoice?.id ?? "-"}
//                         </td>
//                         <td className="px-3 py-3 text-gray-700">
//                           {invoice?.year ?? "-"}
//                         </td>
//                         <td className="px-3 py-3 text-gray-700">
//                           {invoice?.month ?? "-"}
//                         </td>
//                         <td className="px-3 py-3 text-gray-700">
//                           {invoice?.status ?? "-"}
//                         </td>
//                         <td className="px-3 py-3 text-gray-700">
//                           {billingLabel}
//                         </td>
//                         <td className="px-3 py-3 text-gray-700">{total}</td>
//                         <td className="px-3 py-3 text-right">
//                           <button
//                             type="button"
//                             onClick={() => handleDeleteInvoice(invoice)}
//                             disabled={isDeleting}
//                             className={`inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 ${
//                               isDeleting ? "cursor-not-allowed opacity-70" : ""
//                             }`}
//                           >
//                             {isDeleting ? "Deleting..." : "Delete"}
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

// export default SensitiveTools;
