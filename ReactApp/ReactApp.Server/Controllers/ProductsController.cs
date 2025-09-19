using Microsoft.AspNetCore.Mvc;
using ReactApp.Server.Services.Implementations;
using ReactApp.Server.Services.Interfaces;

namespace ReactApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IVendingMachineService _vendingMachineService;
        private readonly IExcelImportService _excelImportService;
        private readonly IProductService _productService;

        public ProductsController(IVendingMachineService vendingMachineService, IExcelImportService excelImportService,
            IProductService productService)
        {
            _vendingMachineService = vendingMachineService;
            _excelImportService = excelImportService;
            _productService = productService;
        }
       

        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] string? brand, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice)
        {
            try
            {
                var products = await _vendingMachineService.GetProductsAsync(brand, minPrice, maxPrice);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportProducts(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("Файл не выбран");

                var extension = System.IO.Path.GetExtension(file.FileName).ToLower();
                if (extension != ".xlsx" && extension != ".xls")
                    return BadRequest("Неверный формат файла. Поддерживаются только файлы Excel (.xlsx, .xls)");

                var products = await _excelImportService.ImportProductsFromExcel(file);
                await _productService.BulkInsertProducts(products);

                return Ok(new { message = "Товары успешно импортированы", count = products.Count });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = "Ошибки при импорте", details = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при импорте: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                return StatusCode(500, $"Ошибка при импорте: {ex.Message}");
            }
        }
    }
}