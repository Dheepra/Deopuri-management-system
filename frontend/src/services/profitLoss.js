import { http } from "./http";

// from / to are optional ISO dates (YYYY-MM-DD). Omit both for an all-time report.
export const getProfitLoss = async (from, to) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const response = await http.get("/deopuri/profit-loss", { params });
    return response.data;
};