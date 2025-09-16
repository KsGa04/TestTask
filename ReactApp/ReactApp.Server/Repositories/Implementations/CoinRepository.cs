using Microsoft.EntityFrameworkCore;
using ReactApp.Server.Data;
using ReactApp.Server.Models;
using ReactApp.Server.Repositories.Interfaces;

namespace ReactApp.Server.Repositories.Implementations
{
    public class CoinRepository : ICoinRepository
    {
        private readonly ApplicationDbContext _context;

        public CoinRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Coin>> GetCoinsAsync()
        {
            return await _context.Coins.ToListAsync();
        }

        public async Task UpdateCoinQuantityAsync(int coinId, int quantity)
        {
            var coin = await _context.Coins.FindAsync(coinId);
            if (coin != null)
            {
                coin.Quantity = quantity;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Dictionary<int, int>> CalculateChangeAsync(decimal amount)
        {
            var coins = await _context.Coins.OrderByDescending(c => c.Value).ToListAsync();
            var change = new Dictionary<int, int>();
            decimal remaining = amount;

            foreach (var coin in coins)
            {
                if (remaining <= 0) break;

                int count = (int)(remaining / coin.Value);
                if (count > 0 && coin.Quantity >= count)
                {
                    change[coin.Value] = count;
                    remaining -= count * coin.Value;
                    coin.Quantity -= count;
                }
            }

            if (remaining > 0)
            {
                throw new InvalidOperationException("Недостаточно монет для выдачи сдачи");
            }

            await _context.SaveChangesAsync();
            return change;
        }
    }
}