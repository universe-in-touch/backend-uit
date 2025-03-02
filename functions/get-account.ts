import axios from "axios";
import { Handler, HandlerEvent } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent) => {
    try {
        const payloadId = event.queryStringParameters?.payload_id; // Обработаем undefined для queryStringParameters
        if (!payloadId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing payload_id" }),
                headers: {
                    "Access-Control-Allow-Origin": "*", // Разрешаем доступ всем
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            };
        }

        // Запрос к XUMM API для получения информации о транзакции
        const xummResponse = await axios.get(
            `https://xumm.app/api/v1/platform/payload/${payloadId}`,
            {
                headers: {
                    "X-API-Key": process.env.XUMM_API_KEY,
                    "X-API-Secret": process.env.XUMM_API_SECRET,
                },
            }
        );

        const account = xummResponse.data.response.account;
        if (!account) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",  // Разрешаем доступ всем
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ error: "Account not found in response" }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Разрешаем доступ всем
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ address: account }),
        };
    } catch (error) {
        console.error("❌ Ошибка при получении данных XUMM:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Разрешаем доступ всем
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
