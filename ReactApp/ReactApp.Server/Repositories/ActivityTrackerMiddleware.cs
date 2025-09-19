using Microsoft.AspNetCore.Http;
using ReactApp.Server.Services.Implementations;
using System.Threading.Tasks;

namespace ReactApp.Server.Middleware
{
    public class ActivityTrackerMiddleware
    {
        private readonly RequestDelegate _next;

        public ActivityTrackerMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ILockService lockService)
        {
            var sessionId = context.Request.Cookies["SessionId"];
            var path = context.Request.Path.Value ?? "";
            var method = context.Request.Method;

            if (!string.IsNullOrEmpty(sessionId))
            {
                // Продлеваем блокировку только для модифицирующих операций
                bool shouldExtendLock =
                    method.Equals("POST", StringComparison.OrdinalIgnoreCase) ||
                    method.Equals("PUT", StringComparison.OrdinalIgnoreCase) ||
                    method.Equals("DELETE", StringComparison.OrdinalIgnoreCase) ||
                    path.Equals("/cart", StringComparison.OrdinalIgnoreCase) ||
                    path.StartsWith("/payment", StringComparison.OrdinalIgnoreCase) ||
                    path.Equals("/api/orders", StringComparison.OrdinalIgnoreCase) ||
                    path.StartsWith("/api/payment", StringComparison.OrdinalIgnoreCase);

                if (shouldExtendLock && lockService.IsCurrentHolder(sessionId))
                {
                    lockService.ExtendLock(sessionId);
                }
            }

            await _next(context);
        }
    }
}