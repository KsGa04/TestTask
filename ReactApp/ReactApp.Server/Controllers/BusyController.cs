using Microsoft.AspNetCore.Mvc;
using ReactApp.Server.Services.Implementations;

namespace ReactApp.Server.Controllers
{
    [ApiController]
    public class BusyController : ControllerBase
    {
        private readonly ILockService _lockService;

        public BusyController(ILockService lockService)
        {
            _lockService = lockService;
        }

        [HttpGet("/busy")]
        public IActionResult Busy()
        {
            return Content(@"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Автомат занят</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 50px; 
                            background-color: #f8f9fa;
                        }
                        .container {
                            max-width: 500px;
                            margin: 0 auto;
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }
                        h1 { 
                            color: #dc3545; 
                            margin-bottom: 20px;
                        }
                        p {
                            color: #6c757d;
                            margin-bottom: 20px;
                        }
                        .release-button {
                            background-color: #dc3545;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                        }
                        .release-button:hover {
                            background-color: #c82333;
                        }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <h1>Извините, в данный момент автомат занят</h1>
                        <p>Другой пользователь использует автомат. Пожалуйста, попробуйте позже.</p>
                        <p>Автомат будет автоматически освобожден через 5 минут неактивности.</p>
                        <button class='release-button' onclick='releaseMachine()'>Экстренное освобождение автомата</button>
                    </div>
                    
                    <script>
                        function releaseMachine() {
                            if (confirm('Вы уверены, что хотите освободить автомат? Это может прервать текущую операцию другого пользователя.')) {
                                fetch('/api/lock/release', {
                                    method: 'POST'
                                })
                                .then(response => {
                                    if (response.ok) {
                                        alert('Автомат успешно освобожден!');
                                        window.location.href = '/';
                                    } else {
                                        alert('Ошибка при освобождении автомата');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                    alert('Ошибка при освобождении автомата');
                                });
                            }
                        }
                    </script>
                </body>
                </html>", "text/html");
        }
    }
}