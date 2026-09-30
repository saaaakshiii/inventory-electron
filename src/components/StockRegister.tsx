import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Download,
  Search,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";

import type { User } from "../types";
import {
  createStockRegister,
  deleteStockRegister,
  getStockRegister,
  updateStockRegister,
  type StockRegisterCreatePayload,
  type StockRegisterItem,
  type StockRegisterUpdatePayload,
} from "../services/stockRegister";

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

interface StockRegisterProps {
  user: User;
  onViewDetail: (id: string) => void;
}

interface AddEditModalProps {
  record?: StockRegisterItem;
  onClose: () => void;
  onSave: (
    payload: StockRegisterCreatePayload | StockRegisterUpdatePayload,
    addAnother?: boolean,
  ) => Promise<void>;
}

function AddEditModal({ record, onClose, onSave }: AddEditModalProps) {
  const isEdit = !!record;

  const [articleName, setArticleName] = useState(record?.article_name ?? "");

  const [particulars, setParticulars] = useState(record?.particulars ?? "");

  const [itemType, setItemType] = useState(record?.item_type ?? "CONSUMABLE");

  const [indentNumber, setIndentNumber] = useState(record?.indent_number ?? "");

  const [orderNumber, setOrderNumber] = useState(record?.order_number ?? "");

  const [billNumber, setBillNumber] = useState(record?.bill_number ?? "");

  const [issuedTo, setIssuedTo] = useState(record?.issued_to?.join(", ") ?? "");

  const [receivedQty, setReceivedQty] = useState(record?.received.qty ?? 0);

  const [receivedRate, setReceivedRate] = useState(record?.received.rate ?? 0);

  const [issuedQty, setIssuedQty] = useState(record?.issued.qty ?? 0);

  const [issuedRate, setIssuedRate] = useState(
    record?.issued.rate ?? record?.received.rate ?? 0,
  );

  const [error, setError] = useState("");

  const receivedAmount = receivedQty * receivedRate;
  const issuedAmount = issuedQty * issuedRate;

  const balanceQty = receivedQty - issuedQty;
  const balanceAmount = receivedAmount - issuedAmount;

  async function handleSubmit(addAnother = false) {
    setError("");

    if (!articleName.trim()) {
      setError("Article name is required.");
      return;
    }

    if (!particulars.trim()) {
      setError("Particulars are required.");
      return;
    }

    if (receivedQty < 0 || issuedQty < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    if (receivedRate < 0 || issuedRate < 0) {
      setError("Rate cannot be negative.");
      return;
    }

    if (issuedQty > receivedQty) {
      setError("Issued quantity cannot exceed received quantity.");
      return;
    }

    if (issuedAmount > receivedAmount) {
      setError("Issued amount cannot exceed received amount.");
      return;
    }

    const issuedToList = issuedTo
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    try {
      if (isEdit) {
        const payload: StockRegisterUpdatePayload = {
          article_name: articleName.trim(),
          particulars: particulars.trim(),
          received: {
            qty: receivedQty,
            rate: receivedRate,
            amt: receivedAmount,
          },
          issued: {
            qty: issuedQty,
            rate: issuedRate,
            amt: issuedAmount,
          },
          item_type: itemType,
          indent_number: indentNumber.trim() || null,
          order_number: orderNumber.trim() || null,
          bill_number: billNumber.trim() || null,
          issued_to: issuedToList.length > 0 ? issuedToList : null,
        };

        await onSave(payload);
        return;
      }

      const payload: StockRegisterCreatePayload = {
        article_name: articleName.trim(),
        particulars: particulars.trim(),
        received: {
          qty: receivedQty,
          rate: receivedRate,
          amt: receivedAmount,
        },
        issued: {
          qty: issuedQty,
          rate: issuedRate,
          amt: issuedAmount,
        },
        item_type: itemType,
        indent_number: indentNumber.trim() || null,
        order_number: orderNumber.trim() || null,
        bill_number: billNumber.trim() || null,
        issued_to: issuedToList.length > 0 ? issuedToList : null,
      };

      await onSave(payload, addAnother);

      if (addAnother) {
        setArticleName("");
        setParticulars("");
        setIndentNumber("");
        setOrderNumber("");
        setBillNumber("");
        setIssuedTo("");
        setReceivedQty(0);
        setReceivedRate(0);
        setIssuedQty(0);
        setIssuedRate(0);
      }
    } catch {
      // Parent handles the API error.
    }
  }

  const inputClass =
    "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isEdit ? "Edit Stock Record" : "Add Stock Record"}
            </h2>

            {isEdit && (
              <p className="text-xs text-slate-500 mt-0.5">
                Last modified{" "}
                {record?.date_of_modification
                  ? new Date(record.date_of_modification).toLocaleString()
                  : ""}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Basic Information
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Article Name
                </label>
                <input
                  value={articleName}
                  onChange={(e) => setArticleName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Printer Paper"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Item Type
                </label>

                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className={inputClass}
                >
                  <option value="CONSUMABLE">CONSUMABLE</option>
                  <option value="NONCONSUMABLE">NONCONSUMABLE</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Particulars
                </label>

                <textarea
                  value={particulars}
                  onChange={(e) => setParticulars(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="Enter particulars"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Indent Number
                </label>

                <input
                  value={indentNumber}
                  onChange={(e) => setIndentNumber(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Order Number
                </label>

                <input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className={inputClass}
                  placeholder="Hexadecimal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Bill Number
                </label>

                <input
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  className={inputClass}
                  placeholder="Hexadecimal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Issued To
                </label>

                <input
                  value={issuedTo}
                  onChange={(e) => setIssuedTo(e.target.value)}
                  className={inputClass}
                  placeholder="Person 1, Person 2"
                />
              </div>
            </div>
          </div>

          {/* Received */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Received Stock
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Rate (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  value={receivedRate}
                  onChange={(e) => setReceivedRate(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Amount (₹)
                </label>

                <div className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-700 mono font-semibold">
                  {fmt(receivedAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Issued */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Issued Stock
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  value={issuedQty}
                  onChange={(e) => setIssuedQty(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Rate (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  value={issuedRate}
                  onChange={(e) => setIssuedRate(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Amount (₹)
                </label>

                <div className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-700 mono font-semibold">
                  {fmt(issuedAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Balance of Stock
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Balance Quantity
                </label>

                <div
                  className={`border rounded-lg px-3 py-2 text-sm mono font-bold ${
                    balanceQty < 0
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  {balanceQty}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Balance Amount (₹)
                </label>

                <div className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-700 mono font-semibold">
                  {fmt(balanceAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>

          <div className="flex gap-2">
            {!isEdit && (
              <button
                onClick={() => handleSubmit(true)}
                className="px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg transition"
              >
                Save & Add Another
              </button>
            )}

            <button
              onClick={() => handleSubmit(false)}
              className="px-5 py-2 text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 rounded-lg transition shadow-sm"
            >
              {isEdit ? "Save Changes" : "Save Record"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  record: StockRegisterItem;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteModal({ record, onClose, onConfirm }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setDeleting(true);

    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Delete Stock Record
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to delete this record? This action cannot be
              undone.
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Article</span>

            <span className="font-semibold text-slate-800">
              {record.article_name}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Particulars</span>

            <span className="font-semibold text-slate-800">
              {record.particulars}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Balance Qty</span>

            <span className="font-semibold text-slate-800 mono">
              {record.balance.qty}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Value</span>

            <span className="font-semibold text-red-700 mono">
              {fmt(record.balance.amt)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={confirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg transition shadow-sm disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StockStatusBadge({
  status,
  balanceQty,
}: {
  status: string;
  balanceQty: number;
}) {
  const outOfStock = status === "OUT_OF_STOCK" || balanceQty === 0;

  if (outOfStock) {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
        OUT OF STOCK
      </span>
    );
  }

  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
      IN STOCK
    </span>
  );
}

export default function StockRegister({
  user,
  onViewDetail,
}: StockRegisterProps) {
  const [records, setRecords] = useState<StockRegisterItem[]>([]);

  const [search, setSearch] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editRecord, setEditRecord] = useState<StockRegisterItem | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<StockRegisterItem | null>(
    null,
  );

  const [toast, setToast] = useState("");

  const PAGE_SIZE = 10;

  const canWrite = user.role === "admin" || user.role === "operator";

  const canEdit = user.role === "admin";

  function showToast(message: string) {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 3000);
  }

  async function loadRecords() {
    setLoading(true);
    setError("");

    try {
      const response = await getStockRegister(user.role, {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        article_name: search.trim() || undefined,
        item_type: itemTypeFilter !== "All" ? itemTypeFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      });

      setRecords(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load stock records.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [user.role, page, search, itemTypeFilter, statusFilter]);

  /*
   * Search/filtering is primarily done by the backend.
   * This small memo is only used for display totals on the
   * currently loaded page.
   */
  const visibleRecords = useMemo(() => {
    return records;
  }, [records]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const totalReceived = visibleRecords.reduce(
    (sum, record) => sum + record.received.amt,
    0,
  );

  const totalIssued = visibleRecords.reduce(
    (sum, record) => sum + record.issued.amt,
    0,
  );

  const totalBalance = visibleRecords.reduce(
    (sum, record) => sum + record.balance.amt,
    0,
  );

  async function handleSave(
    payload: StockRegisterCreatePayload | StockRegisterUpdatePayload,
    addAnother = false,
  ) {
    try {
      if (editRecord) {
        await updateStockRegister(
          user.role,
          editRecord.id,
          payload as StockRegisterUpdatePayload,
        );

        setEditRecord(null);
        showToast("Stock record updated successfully.");
      } else {
        await createStockRegister(
          user.role,
          payload as StockRegisterCreatePayload,
        );

        showToast("Stock record added successfully.");

        if (!addAnother) {
          setShowAdd(false);
        }
      }

      await loadRecords();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save stock record.";

      setError(message);
      showToast(message);
    }
  }

  async function handleDelete() {
    if (!deleteRecord) return;

    try {
      await deleteStockRegister(user.role, deleteRecord.id);

      setDeleteRecord(null);

      showToast("Stock record deleted.");

      /*
       * If the current page becomes empty after deleting
       * the last record, move back one page.
       */
      if (records.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        await loadRecords();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete stock record.";

      setError(message);
      showToast(message);
    }
  }

  return (
    <div className="p-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Stock Register</h1>

          <p className="text-sm text-slate-500 mt-0.5">
            Digital stock register · {total} records
          </p>
        </div>

        {canWrite && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition shadow-sm">
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={() => {
                setError("");
                setShowAdd(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">Stock Register Error</p>

            <p className="mt-0.5">{error}</p>
          </div>

          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search article..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={itemTypeFilter}
            onChange={(e) => {
              setItemTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="All">All Types</option>
            <option value="CONSUMABLE">CONSUMABLE</option>
            <option value="NONCONSUMABLE">NONCONSUMABLE</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="All">All</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
          </select>

          {(search || itemTypeFilter !== "All" || statusFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setItemTypeFilter("All");
                setStatusFilter("All");
                setPage(1);
              }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-sticky">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b border-slate-200">
                  Date
                </th>

                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  Particulars
                </th>

                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  Indent
                </th>

                <th
                  className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200 bg-blue-50 text-blue-700"
                  colSpan={3}
                >
                  Received
                </th>

                <th
                  className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200 bg-orange-50 text-orange-700"
                  colSpan={3}
                >
                  Issued
                </th>

                <th
                  className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200 bg-emerald-50 text-emerald-700"
                  colSpan={2}
                >
                  Balance
                </th>

                <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  Status
                </th>

                <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  Actions
                </th>
              </tr>

              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="px-4 pb-2" />
                <th className="px-4 pb-2" />
                <th className="px-4 pb-2" />

                <th className="text-right px-4 pb-2 text-[10px] font-semibold bg-blue-50 text-blue-600">
                  Qty
                </th>

                <th className="text-right px-4 pb-2 text-[10px] font-semibold bg-blue-50 text-blue-600">
                  Rate
                </th>

                <th className="text-right px-4 pb-2 text-[10px] font-semibold bg-blue-50 text-blue-600">
                  Amount
                </th>

                <th className="text-right px-4 pb-2 text-[10px] font-semibold bg-orange-50 text-orange-600">
                  Qty
                </th>

                <th className="text-right px-4 pb-2 text-[10px] font-semibold bg-orange-50 text-orange-600">
                  Rate
                </th>

                <th className="text-right px-4 pb-2 text-[10px] font-semibold bg-orange-50 text-orange-600">
                  Amount
                </th>

                <th className="text-right px-4 pb-2 text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                  Qty
                </th>

                <th className="text-right px-4 pb-2 text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                  Amount
                </th>

                <th className="px-4 pb-2" />
                <th className="px-4 pb-2" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={13} className="text-center py-16 text-slate-400">
                    Loading stock records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-16 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />

                    <p className="font-medium">No stock records found</p>

                    <p className="text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-600 mono text-xs whitespace-nowrap">
                      {new Date(rec.date_of_entry).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 text-sm">
                        {rec.article_name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {rec.particulars}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {rec.item_type}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-slate-600 text-xs mono">
                      {rec.indent_number || "—"}
                    </td>

                    <td className="px-4 py-3 text-right mono text-sm text-blue-700 font-semibold bg-blue-50/40">
                      {rec.received.qty}
                    </td>

                    <td className="px-4 py-3 text-right mono text-xs text-blue-600 bg-blue-50/40">
                      {fmt(rec.received.rate)}
                    </td>

                    <td className="px-4 py-3 text-right mono text-sm font-bold text-blue-800 bg-blue-50/40">
                      {fmt(rec.received.amt)}
                    </td>

                    <td className="px-4 py-3 text-right mono text-sm text-orange-700 font-semibold bg-orange-50/40">
                      {rec.issued.qty}
                    </td>

                    <td className="px-4 py-3 text-right mono text-xs text-orange-600 bg-orange-50/40">
                      {fmt(rec.issued.rate)}
                    </td>

                    <td className="px-4 py-3 text-right mono text-sm font-bold text-orange-800 bg-orange-50/40">
                      {fmt(rec.issued.amt)}
                    </td>

                    <td className="px-4 py-3 text-right mono text-sm text-emerald-700 font-bold bg-emerald-50/40">
                      {rec.balance.qty}
                    </td>

                    <td className="px-4 py-3 text-right mono text-sm font-bold text-emerald-800 bg-emerald-50/40">
                      {fmt(rec.balance.amt)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <StockStatusBadge
                        status={rec.status}
                        balanceQty={rec.balance.qty}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewDetail(rec.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {canEdit && (
                          <>
                            <button
                              onClick={() => setEditRecord(rec)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeleteRecord(rec)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium">Total Received</p>

            <p className="font-bold text-blue-700 mono">{fmt(totalReceived)}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium">Total Issued</p>

            <p className="font-bold text-orange-700 mono">{fmt(totalIssued)}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium">
              Current Stock Value
            </p>

            <p className="font-bold text-emerald-700 mono">
              {fmt(totalBalance)}
            </p>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–
              {Math.min(page * PAGE_SIZE, total)} of {total} records
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 text-xs rounded-lg font-semibold transition ${
                    page === n
                      ? "bg-blue-700 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(showAdd || editRecord) && (
        <AddEditModal
          record={editRecord ?? undefined}
          onClose={() => {
            setShowAdd(false);
            setEditRecord(null);
          }}
          onSave={handleSave}
        />
      )}

      {deleteRecord && (
        <DeleteModal
          record={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2.5 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg text-sm z-50 fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
