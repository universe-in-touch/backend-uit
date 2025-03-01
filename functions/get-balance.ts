import { Handler } from "@netlify/functions";
import { XummSdk } from "xumm-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.XUMM_API_KEY;
const apiSecret = process.env.XUMM_API_SECRET;

const xumm = new XummSdk(apiKey, apiSecret);

const handler: Handler = async (event, context) => {
    const account = event.queryStringParameters?.account;

    if (!account) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Account address is required" }),
        };
    }

    try {
        // Получаем баланс
        const response = await xumm.account.info(account);
        console.log("📦 Account balance data:", response);

        return {
            statusCode: 200,
            body: JSON.stringify({ balance: response.result.xrp_balance }),
        };
    } catch (error) {
        console.error("❌ Ошибка при получении баланса:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch balance" }),
        };
    }
};

export { handler };
