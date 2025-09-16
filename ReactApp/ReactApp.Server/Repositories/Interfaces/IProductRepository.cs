using ReactApp.Server.Models;

namespace ReactApp.Server.Repositories.Interfaces
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetProductsAsync(string? brand, decimal? minPrice, decimal? maxPrice);
        Task<Product?> GetProductByIdAsync(int id);
        Task UpdateProductQuantityAsync(int productId, int quantity);
    }
}