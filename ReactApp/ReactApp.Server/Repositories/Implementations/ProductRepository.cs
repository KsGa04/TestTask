using Microsoft.EntityFrameworkCore;
using ReactApp.Server.Data;
using ReactApp.Server.Models;
using ReactApp.Server.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ReactApp.Server.Repositories.Implementations
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetProductsAsync(string? brand, decimal? minPrice, decimal? maxPrice)
        {
            IQueryable<Product> query = _context.Products.Include(p => p.Brand);

            if (!string.IsNullOrEmpty(brand) && brand != "Все бренды")
            {
                query = query.Where(p => p.Brand.Name == brand);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            return await query.ToListAsync();
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _context.Products.Include(p => p.Brand).FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task UpdateProductQuantityAsync(int productId, int quantity)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product != null)
            {
                product.Quantity = quantity;
                await _context.SaveChangesAsync();
            }
        }

        public async Task BulkInsertProducts(List<Product> products)
        {
            try
            {
                await _context.Products.AddRangeAsync(products);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Ошибка при сохранении: {ex.InnerException?.Message}");
                throw;
            }
        }
    }
}