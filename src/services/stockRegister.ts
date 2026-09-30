import { apiRequest } from './api';

export interface StockRegisterTuple {
  qty: number;
  rate: number;
  amt: number;
}

export interface BalanceTuple {
  qty: number;
  amt: number;
}

export interface StockRegisterItem {
  id: string;
  article_name: string;
  date_of_entry: string;
  date_of_modification: string;
  particulars: string;

  received: StockRegisterTuple;
  issued: StockRegisterTuple;
  balance: BalanceTuple;

  item_type: string;
  indent_number?: string | null;
  order_number?: string | null;
  bill_number?: string | null;
  issued_to?: string[] | null;

  status: string;
  operator_id?: string | null;
}

export interface StockRegisterResponse {
  total: number;
  limit: number;
  offset: number;
  items: StockRegisterItem[];
}

export interface StockRegisterCreatePayload {
  article_name: string;
  particulars: string;

  received: {
    qty: number;
    rate: number;
    amt?: number;
  };

  issued: {
    qty: number;
    rate: number;
    amt?: number;
  };

  item_type: string;
  indent_number?: string | null;
  order_number?: string | null;
  bill_number?: string | null;
  issued_to?: string[] | null;
}

export interface StockRegisterUpdatePayload {
  article_name?: string;
  particulars?: string;

  received?: {
    qty: number;
    rate: number;
    amt?: number;
  };

  issued?: {
    qty: number;
    rate: number;
    amt?: number;
  };

  item_type?: string;
  indent_number?: string | null;
  order_number?: string | null;
  bill_number?: string | null;
  issued_to?: string[] | null;
}

export async function getStockRegister(
  role: string,
  params: {
    limit?: number;
    offset?: number;
    article_name?: string;
    item_type?: string;
    status?: string;
  } = {},
) {
  const query = new URLSearchParams();

  if (params.limit !== undefined) {
    query.set('limit', String(params.limit));
  }

  if (params.offset !== undefined) {
    query.set('offset', String(params.offset));
  }

  if (params.article_name) {
    query.set('article_name', params.article_name);
  }

  if (params.item_type) {
    query.set('item_type', params.item_type);
  }

  if (params.status) {
    query.set('status', params.status);
  }

  const queryString = query.toString();

  return apiRequest<StockRegisterResponse>(
    `/${role}/view${queryString ? `?${queryString}` : ''}`,
  );
}

export async function createStockRegister(
  role: string,
  payload: StockRegisterCreatePayload,
) {
  return apiRequest<StockRegisterItem>(`/${role}/add`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateStockRegister(
  role: string,
  entryId: string,
  payload: StockRegisterUpdatePayload,
) {
  return apiRequest<StockRegisterItem>(
    `/${role}/update/${entryId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function submitStockRegister(
  role: string,
  entryId: string,
) {
  return apiRequest<StockRegisterItem>(
    `/${role}/submit/${entryId}`,
    {
      method: 'POST',
    },
  );
}

export async function deleteStockRegister(
  role: string,
  entryId: string,
) {
  return apiRequest<void>(
    `/${role}/delete/${entryId}`,
    {
      method: 'DELETE',
    },
  );
}

export async function getStockRegisterById(
  role: string,
  entryId: string,
) {
  return apiRequest<StockRegisterItem>(
    `/${role}/view/${entryId}`,
  );
}