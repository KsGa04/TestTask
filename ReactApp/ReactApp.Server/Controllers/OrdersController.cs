using Microsoft.AspNetCore.Mvc;
using ReactApp.Server.Services.Interfaces;

namespace ReactApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IVendingMachineService _vendingMachineService;

        public OrdersController(IVendingMachineService vendingMachineService)
        {
            _vendingMachineService = vendingMachineService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] Dictionary<int, int> items)
        {
            try
            {
                var order = await _vendingMachineService.CreateOrderAsync(items);
                return Ok(order);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}