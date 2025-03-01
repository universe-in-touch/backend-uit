import { Handler } from "@netlify/functions";
import { XummSdk } from "xumm-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.XUMM_API_KEY;
const apiSecret = process.env.XUMM_API_SECRET;

const xumm = new XummSdk(apiKey, apiSecret);

const handler: Handler = async (event, context) => {
    console.log("📩 Запрос на создание ордера...");

    try {
        const params = event.queryStringParameters;
        const xrpPay = Math.round(parseFloat(params?.xrpPay || "0") * 1000000); // XRP в дропах (целое число)
        const babaGet = parseFloat(params?.babaGet || "0");
        const refCode = params?.refCode || "";

        console.log("🔍 Полученные параметры:", { xrpPay, babaGet, refCode });
        console.log("BABA:", babaGet.toString());
        if (xrpPay <= 0 || babaGet <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Неверные параметры запроса." })
            };
        }

        console.log("🛠 Генерация XUMM payload для ордера...");
        const payload = await xumm.payload.create({
            TransactionType: "OfferCreate",
            Fee: "12",
            TakerPays: {
                currency: "4241424100000000000000000000000000000000", // 40-байтовый хеш валюты (BABA)
                issuer: "rdYLqmL2paFvDL2ERw6VHuSuken5uQyrK",
                value: babaGet.toString()
            },
            TakerGets: xrpPay.toString(),
            Memos: [
                {
                    Memo: {
                        MemoType: Buffer.from("refCode", "utf8").toString("hex"),
                        MemoData: Buffer.from(refCode, "utf8").toString("hex")
                    }
                }
            ]
        }, true);


        console.log("✅ Payload создан:", payload);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            },
            body: JSON.stringify({ uuid: payload.uuid })
        };
    } catch (error) {
        console.error("❌ Ошибка создания ордера через XUMM:", error);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Ошибка при создании ордера через XUMM" })
        };
    }
};

export { handler };
