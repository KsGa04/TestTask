using Microsoft.AspNetCore.Mvc;
using ReactApp.Server.Services.Interfaces;

namespace ReactApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IVendingMachineService _vendingMachineService;

        public PaymentController(IVendingMachineService vendingMachineService)
        {
            _vendingMachineService = vendingMachineService;
        }

        [HttpPost("{orderId}")]
        public async Task<IActionResult> ProcessPayment(int orderId, [FromBody] Dictionary<int, int> coins)
        {
            try
            {
                var change = await _vendingMachineService.ProcessPaymentAsync(orderId, coins);
                return Ok(new { Change = change, Message = "Оплата прошла успешно" });
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
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