import { http } from "./http";

export const getProfitLoss = async () => {
    const response = await http.get("/api/profit-loss");
    return response.data;
};