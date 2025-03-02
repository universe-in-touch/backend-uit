import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { XummSdk } from "xumm-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.XUMM_API_KEY;
const apiSecret = process.env.XUMM_API_SECRET;

const xumm = new XummSdk(apiKey, apiSecret);

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    console.log("📩 Запрос на создание ордера...");

    try {
        const params = event.queryStringParameters;
        const xrpPay = Math.round(parseFloat(params?.xrpPay || "0") * 1000000); // XRP в дропах (целое число)
        const babaGet = parseFloat(params?.babaGet || "0");

        console.log("🔍 Полученные параметры:", { xrpPay, babaGet });

        if (xrpPay <= 0 || babaGet <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Неверные параметры запроса." }),
            };
        }

        console.log("🛠 Генерация XUMM payload для ордера...");
        const payload = await xumm.payload.create(
            {
                txjson: {
                    TransactionType: "OfferCreate",
                    Fee: "12",
                    TakerPays: {
                        currency: "4241424100000000000000000000000000000000", // 40-байтовый хеш валюты (BABA)
                        issuer: "rdYLqmL2paFvDL2ERw6VHuSuken5uQyrK",
                        value: babaGet.toString(),
                    },
                    TakerGets: xrpPay.toString(),
                },
                options: {
                    return_url: {
                        app: "https://universe-in-touch.github.io", // Для веба
                    },
                    force_network: "MAINNET", // Основная сеть
                },
                custom_meta: {
                    instruction: "Confirm the order directly to DEX.", // Сообщение для пользователя
                },
            },
            true
        );

        console.log("✅ Payload создан:", payload);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",  // указываем разрешенные заголовки
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // указываем допустимые методы
            } as { [key: string]: string },  // Принудительно указываем тип как строку для всех заголовков
            body: JSON.stringify({ uuid: payload?.uuid || "payload null" }),
        };
    } catch (error: any) {
        console.error("❌ Ошибка создания ордера через XUMM:", error.response ? error.response.data : error);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            } as { [key: string]: string },
            body: JSON.stringify({ error: "Ошибка при создании ордера через XUMM", details: error.response ? error.response.data : error.message }),
        };
    }
};

export { handler };
