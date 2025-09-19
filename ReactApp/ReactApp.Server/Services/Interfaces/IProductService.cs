using ReactApp.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ReactApp.Server.Services.Interfaces
{
    public interface IProductService
    {
        Task BulkInsertProducts(List<Product> products);
        Task<IEnumerable<Product>> GetProductsAsync(string? brand, decimal? minPrice, decimal? maxPrice);
        Task<Product?> GetProductByIdAsync(int id);
        Task UpdateProductQuantityAsync(int productId, int quantity);
    }
}