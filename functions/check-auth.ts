import axios from "axios";
import { Handler, HandlerEvent } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent) => {
    const allowedOrigins = ['https://localhost:3000', 'https://твоя-гитхаб-страница.github.io'];
    const origin = event.headers.origin || '';

    if (!allowedOrigins.includes(origin)) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: "Доступ запрещен" }),
        };
    }

    try {
        const payloadId = event.queryStringParameters?.payload_id;
        if (!payloadId) {
            return {
                statusCode: 400,
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
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ status }),
        };
    } catch (error) {
        console.error("❌ Ошибка при получении данных XUMM:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
