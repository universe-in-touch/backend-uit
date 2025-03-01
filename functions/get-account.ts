import axios from "axios";
import { Handler, HandlerEvent } from "@netlify/functions";


export const handler = async (event) => {
    const allowedOrigins = ['https://localhost:3000', 'https://твоя-гитхаб-страница.github.io'];
    const origin = event.headers.origin;
    const isLocal = origin.includes('localhost'); // Проверка на локальное окружение

    // Проверка на допустимость источника
    if (!allowedOrigins.includes(origin)) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: "Доступ запрещен" }),
        };
    }

    try {
        const payloadId = event.queryStringParameters.payload_id;
        if (!payloadId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing payload_id" }),
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
                    "Access-Control-Allow-Origin": "*",  // Устанавливаем корректный CORS заголовок
                    "Access-Control-Allow-Headers": "Content-Type",

                },
                body: JSON.stringify({ error: "Account not found in response" }),
            };
        }

        // Устанавливаем cookies с учетом окружения
        const cookieSettings = isLocal
            ? 'sessionId=abc123; Path=/; HttpOnly; SameSite=None' // Без Secure для локалки
            : 'sessionId=abc123; Path=/; Secure; HttpOnly; SameSite=None'; // С Secure для продакшн

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Поддержка CORS для корректного источника
                "Access-Control-Allow-Headers": "Content-Type",
                "Set-Cookie": cookieSettings,  // Устанавливаем cookies
            },
            body: JSON.stringify({ address: account }),
        };
    } catch (error) {
        console.error("❌ Ошибка при получении данных XUMM:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Поддержка CORS
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
