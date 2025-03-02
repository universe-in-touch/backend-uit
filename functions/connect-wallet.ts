import { Handler } from "@netlify/functions";
import { XummSdk } from "xumm-sdk";
import * as dotenv from "dotenv";

// Загрузка переменных окружения из .env файла
dotenv.config();

// Получение API ключей XUMM из переменных окружения
const apiKey = process.env.XUMM_API_KEY;
const apiSecret = process.env.XUMM_API_SECRET;

// Инициализация XUMM SDK с использованием API ключей
const xumm = new XummSdk(apiKey, apiSecret);

// Основной обработчик Netlify Functions
const handler: Handler = async (event, context) => {
    console.log("📩 Запрос на подключение кошелька...");

    try {
        // Генерация XUMM payload для подключения
        console.log("🛠 Генерация XUMM payload...");

        // Генерация payload для XUMM с обязательным TransactionType
        const payload = await xumm.payload.create({
            txjson: {
                TransactionType: "SignIn",  // Добавление обязательного TransactionType
            },
            options: {
                return_url: {
                    app: "https://universe-in-touch.github.io", // Мобильный редирект (если нужно)
                },
                force_network: "MAINNET",  // Указание сети, например MAINNET
            },
            custom_meta: {
                instruction: "Welcome to the Universe In Touch!",  // Дополнительные инструкции
            }
        });

        // Проверка на null или пустое значение payload
        if (!payload) {
            throw new Error("Не удалось создать payload для XUMM.");
        }

        console.log("✅ Payload успешно создан:", payload);

        // Возвращаем только uuid в ответе
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Разрешает доступ с любых источников
                "Access-Control-Allow-Headers": "Content-Type", // Разрешаем заголовки Content-Type
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Разрешаем методы GET, POST, OPTIONS
            },
            body: JSON.stringify({ uuid: payload.uuid }), // Отправляем только uuid
        };

        return response; // Возвращаем успешный ответ
    } catch (error) {
        // Логируем ошибку в случае неудачи
        console.error("❌ Ошибка при создании XUMM payload:", error);

        // Ответ с ошибкой
        const errorResponse = {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Разрешаем доступ с любых источников
            },
            body: JSON.stringify({ error: "Ошибка при создании XUMM payload" }),
        };

        return errorResponse; // Возвращаем ответ с ошибкой
    }
};

export { handler };
