using Microsoft.AspNetCore.Http;
using ReactApp.Server.Services.Implementations;
using System;
using System.Threading.Tasks;

namespace ReactApp.Server.Middleware
{
    public class GlobalLockMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalLockMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ILockService lockService)
        {
            // Получаем строковое представление пути
            var path = context.Request.Path.Value ?? "";
            var method = context.Request.Method;

            // Исключаем статические файлы, страницу busy и API endpoint для освобождения
            if (path.StartsWith("/_framework") ||
                path.StartsWith("/css") ||
                path.StartsWith("/js") ||
                path.StartsWith("/lib") ||
                path.Equals("/busy", StringComparison.OrdinalIgnoreCase) ||
                path.Equals("/api/lock/release", StringComparison.OrdinalIgnoreCase) ||
                path.Equals("/api/lock/status", StringComparison.OrdinalIgnoreCase) ||
                path.EndsWith(".ico") ||
                path.EndsWith(".css") ||
                path.EndsWith(".js") ||
                path.EndsWith(".png") ||
                path.EndsWith(".jpg") ||
                path.EndsWith(".jpeg") ||
                path.EndsWith(".gif") ||
                path.EndsWith(".svg"))
            {
                await _next(context);
                return;
            }

            // Получаем идентификатор сессии из cookie
            var sessionId = context.Request.Cookies["SessionId"];
            Console.WriteLine($"Запрос от сессии: {sessionId}, путь: {path}, метод: {method}");

            // Если cookie нет, создаем новый идентификатор
            if (string.IsNullOrEmpty(sessionId))
            {
                sessionId = Guid.NewGuid().ToString();
                context.Response.Cookies.Append("SessionId", sessionId, new CookieOptions
                {
                    Expires = DateTime.Now.AddHours(1),
                    HttpOnly = true,
                    SameSite = SameSiteMode.Strict
                });
                Console.WriteLine($"Создана новая сессия: {sessionId}");
            }

            // Проверяем, заблокирован ли автомат другим пользователем
            var lockInfo = lockService.GetLockInfo();

            Console.WriteLine($"Блокировка: {lockInfo.IsLocked}, текущий владелец: {lockInfo.CurrentHolder}, запрос от: {sessionId}");

            // Блокируем доступ только если автомат занят другим пользователем
            // И это не GET-запрос для получения данных
            if (lockInfo.IsLocked && lockInfo.CurrentHolder != sessionId)
            {
                // Разрешаем GET-запросы для получения данных (просмотр товаров)
                // но блокируем модифицирующие операции
                bool isReadOnlyRequest = method.Equals("GET", StringComparison.OrdinalIgnoreCase) &&
                                        !path.StartsWith("/api/orders", StringComparison.OrdinalIgnoreCase) &&
                                        !path.StartsWith("/api/payment", StringComparison.OrdinalIgnoreCase) &&
                                        !path.Equals("/cart", StringComparison.OrdinalIgnoreCase);

                if (!isReadOnlyRequest)
                {
                    Console.WriteLine($"Блокировка доступа для сессии: {sessionId}");

                    // Для API запросов возвращаем JSON с кодом 423
                    if (path.StartsWith("/api"))
                    {
                        context.Response.StatusCode = 423;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsync("{\"error\": \"Извините, в данный момент автомат занят\"}");
                        return;
                    }

                    // Для остальных запросов перенаправляем на страницу занятости
                    context.Response.Redirect("/busy");
                    return;
                }
            }

            // Устанавливаем блокировку только для модифицирующих операций
            bool shouldAcquireLock =
                method.Equals("POST", StringComparison.OrdinalIgnoreCase) ||
                method.Equals("PUT", StringComparison.OrdinalIgnoreCase) ||
                method.Equals("DELETE", StringComparison.OrdinalIgnoreCase) ||
                path.Equals("/cart", StringComparison.OrdinalIgnoreCase) ||
                path.StartsWith("/payment", StringComparison.OrdinalIgnoreCase) ||
                path.Equals("/api/orders", StringComparison.OrdinalIgnoreCase) ||
                path.StartsWith("/api/payment", StringComparison.OrdinalIgnoreCase);

            if (shouldAcquireLock)
            {
                Console.WriteLine($"Устанавливаем блокировку для действия: {method} {path}");
                lockService.TryAcquireLock(sessionId);
            }

            await _next(context);
        }
    }
}