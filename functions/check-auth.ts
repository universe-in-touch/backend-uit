import axios from "axios";
import { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
    const origin = event.headers.origin || '*'; // Если origin не задан, ставим '*'

    // Ответ для preflight-запроса (OPTIONS)
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers: {
                "Access-Control-Allow-Origin": "*", // Разрешаем доступ с любых доменов
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-API-Key, X-API-Secret",
                "Access-Control-Max-Age": "86400", // Кеширование ответа для CORS
            },
            body: '',
        };
    }

    try {
        const payloadId = event.queryStringParameters?.payload_id;
        if (!payloadId) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Разрешаем доступ с любых доменов
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ error: "Missing payload_id" }),
            };
        }

        // Запрос к XUMM API
        const xummResponse = await axios.get(
            `https://xumm.app/api/v1/platform/payload/${payloadId}`,
            {
                headers: {
                    "X-API-Key": process.env.XUMM_API_KEY || '',
                    "X-API-Secret": process.env.XUMM_API_SECRET || '',
                },
            }
        );

        // Получаем статус подписания
        const signed = xummResponse.data.meta.signed;
        const expired = xummResponse.data.meta.expired;

        let status: "signed" | "rejected" | "expired" | "pending";

        if (expired) {
            status = "expired";
        } else if (signed === true) {
            status = "signed";
        } else if (signed === false) {
            status = "rejected";
        } else {
            status = "pending";
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Разрешаем доступ с любых доменов
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ status }),
        };
    } catch (error) {
        console.error("❌ Ошибка при получении данных XUMM:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Разрешаем доступ с любых доменов
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
