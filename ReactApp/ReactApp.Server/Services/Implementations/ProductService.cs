using ReactApp.Server.Models;
using ReactApp.Server.Repositories.Interfaces;
using ReactApp.Server.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ReactApp.Server.Services.Implementations
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task BulkInsertProducts(List<Product> products)
        {
            await _productRepository.BulkInsertProducts(products);
        }

        public async Task<IEnumerable<Product>> GetProductsAsync(string? brand, decimal? minPrice, decimal? maxPrice)
        {
            return await _productRepository.GetProductsAsync(brand, minPrice, maxPrice);
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _productRepository.GetProductByIdAsync(id);
        }

        public async Task UpdateProductQuantityAsync(int productId, int quantity)
        {
            await _productRepository.UpdateProductQuantityAsync(productId, quantity);
        }
    }
}