using ReactApp.Server.Models;

namespace ReactApp.Server.Repositories.Interfaces
{
    public interface ICoinRepository
    {
        Task<IEnumerable<Coin>> GetCoinsAsync();
        Task UpdateCoinQuantityAsync(int coinId, int quantity);
        Task<Dictionary<int, int>> CalculateChangeAsync(decimal amount);
    }
}