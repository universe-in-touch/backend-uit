import { Handler } from "@netlify/functions";
import { XummSdk } from "xumm-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.XUMM_API_KEY;
const apiSecret = process.env.XUMM_API_SECRET;

const xumm = new XummSdk(apiKey, apiSecret);

const handler: Handler = async (event, context) => {
    console.log("📩 Запрос на подключение Trustline...");

    try {
        // Создание payload для подключения
        console.log("🛠 Генерация XUMM payload...");
        const payload = await xumm.payload.create({
            TransactionType: "TrustSet",
            LimitAmount: {
                currency: "4241424100000000000000000000000000000000",
                issuer: "rdYLqmL2paFvDL2ERw6VHuSuken5uQyrK", // Адрес эмитента BABA
                value: "1000000",
            },
            Flags: 0x00020000,
        });

        // Проверка на null и обработка этого случая
        if (!payload) {
            throw new Error("Не удалось создать payload для XUMM.");
        }

        console.log("✅ Payload создан:", payload);

        // Возвращаем только uuid
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Разрешает CORS-запросы
                "Access-Control-Allow-Headers": "Content-Type", // Исправление, добавление обязательных заголовков
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Добавление разрешенных методов
            },
            body: JSON.stringify({ uuid: payload.uuid }), // Отправляем только uuid
        };

        return response; // Возвращаем полный объект с правильной типизацией
    } catch (error) {
        console.error("❌ Ошибка создания XUMM payload:", error);

        // Ошибка: типы возвращаемых данных тоже должны быть согласованы
        const errorResponse = {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Добавление корректных заголовков для ошибки
            },
            body: JSON.stringify({ error: "Ошибка при создании XUMM payload" }),
        };

        return errorResponse; // Возвращаем корректный ответ об ошибке
    }
};

export { handler };
