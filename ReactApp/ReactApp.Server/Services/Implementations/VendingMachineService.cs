using ReactApp.Server.Models;
using ReactApp.Server.Repositories.Interfaces;
using ReactApp.Server.Services.Interfaces;

namespace ReactApp.Server.Services.Implementations
{
    public class VendingMachineService : IVendingMachineService
    {
        private readonly IProductRepository _productRepository;
        private readonly ICoinRepository _coinRepository;
        private readonly IOrderRepository _orderRepository;

        public VendingMachineService(
            IProductRepository productRepository,
            ICoinRepository coinRepository,
            IOrderRepository orderRepository)
        {
            _productRepository = productRepository;
            _coinRepository = coinRepository;
            _orderRepository = orderRepository;
        }

        public async Task<IEnumerable<Product>> GetProductsAsync(string? brand, decimal? minPrice, decimal? maxPrice)
        {
            return await _productRepository.GetProductsAsync(brand, minPrice, maxPrice);
        }

        public async Task<Order> CreateOrderAsync(Dictionary<int, int> items)
        {
            var order = new Order
            {
                OrderDate = DateTime.Now,
                TotalAmount = 0,
                OrderItems = new List<OrderItem>()
            };

            foreach (var item in items)
            {
                var product = await _productRepository.GetProductByIdAsync(item.Key);
                if (product == null || product.Quantity < item.Value)
                {
                    throw new InvalidOperationException($"Товар с ID {item.Key} недоступен");
                }

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    BrandName = product.Brand.Name,
                    UnitPrice = product.Price,
                    Quantity = item.Value
                };

                order.OrderItems.Add(orderItem);
                order.TotalAmount += orderItem.TotalPrice;

                // Обновляем количество товара
                await _productRepository.UpdateProductQuantityAsync(product.Id, product.Quantity - item.Value);
            }

            return await _orderRepository.CreateOrderAsync(order);
        }

        public async Task<Dictionary<int, int>> ProcessPaymentAsync(int orderId, Dictionary<int, int> coins)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
            {
                throw new ArgumentException("Заказ не найден");
            }

            // Добавляем монеты в автомат
            foreach (var coin in coins)
            {
                var dbCoin = (await _coinRepository.GetCoinsAsync()).FirstOrDefault(c => c.Value == coin.Key);
                if (dbCoin != null)
                {
                    await _coinRepository.UpdateCoinQuantityAsync(dbCoin.Id, dbCoin.Quantity + coin.Value);
                }
            }

            // Рассчитываем сдачу
            decimal paidAmount = coins.Sum(c => c.Key * c.Value);
            decimal changeAmount = paidAmount - order.TotalAmount;

            if (changeAmount < 0)
            {
                throw new InvalidOperationException("Недостаточно средств для оплаты");
            }

            if (changeAmount == 0)
            {
                return new Dictionary<int, int>();
            }

            return await _coinRepository.CalculateChangeAsync(changeAmount);
        }
    }
}