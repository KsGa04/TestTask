using ReactApp.Server.Models;

namespace ReactApp.Server.Services.Interfaces
{
    public interface IVendingMachineService
    {
        Task<IEnumerable<Product>> GetProductsAsync(string? brand, decimal? minPrice, decimal? maxPrice);
        Task<Order> CreateOrderAsync(Dictionary<int, int> items);
        Task<Dictionary<int, int>> ProcessPaymentAsync(int orderId, Dictionary<int, int> coins);
    }
}