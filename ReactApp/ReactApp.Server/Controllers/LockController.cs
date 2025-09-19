using Microsoft.AspNetCore.Mvc;
using ReactApp.Server.Services.Implementations;

namespace ReactApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LockController : ControllerBase
    {
        private readonly ILockService _lockService;

        public LockController(ILockService lockService)
        {
            _lockService = lockService;
        }

        [HttpPost("release")]
        public IActionResult ForceRelease()
        {
            _lockService.ForceRelease();
            return Ok(new { message = "Автомат освобожден" });
        }
    }
}