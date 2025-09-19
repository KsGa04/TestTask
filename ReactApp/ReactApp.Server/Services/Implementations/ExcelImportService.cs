using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using ReactApp.Server.Data;
using ReactApp.Server.Models;
using ReactApp.Server.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ReactApp.Server.Services.Implementations
{
    public class ExcelImportService : IExcelImportService
    {
        private readonly ApplicationDbContext _context;

        public ExcelImportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Product>> ImportProductsFromExcel(IFormFile file)
        {
            var products = new List<Product>();
            var errors = new List<string>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;

                IWorkbook workbook;

                // Определяем формат файла
                if (file.FileName.EndsWith(".xlsx"))
                {
                    workbook = new XSSFWorkbook(stream);
                }
                else if (file.FileName.EndsWith(".xls"))
                {
                    workbook = new HSSFWorkbook(stream);
                }
                else
                {
                    throw new ArgumentException("Неверный формат файла. Поддерживаются только файлы Excel (.xlsx, .xls)");
                }

                var sheet = workbook.GetSheetAt(0);
                var rowCount = sheet.LastRowNum;

                // Получаем все существующие бренды для проверки
                var existingBrands = await _context.Brands.ToListAsync();
                var existingBrandIds = new HashSet<int>(existingBrands.Select(b => b.Id));

                // Пропускаем заголовок (первую строку)
                for (int row = 1; row <= rowCount; row++)
                {
                    var currentRow = sheet.GetRow(row);
                    if (currentRow == null) continue;

                    // Парсим BrandId
                    var brandIdValue = GetCellValue(currentRow.GetCell(3));
                    if (!int.TryParse(brandIdValue, out int brandId) || brandId <= 0)
                    {
                        errors.Add($"Строка {row}: неверный BrandId '{brandIdValue}'");
                        continue;
                    }

                    // Проверяем существование бренда
                    if (!existingBrandIds.Contains(brandId))
                    {
                        errors.Add($"Строка {row}: бренд с ID {brandId} не существует");
                        continue;
                    }

                    // Парсим цену и количество
                    var priceValue = GetCellValue(currentRow.GetCell(1));
                    var quantityValue = GetCellValue(currentRow.GetCell(2));

                    if (!decimal.TryParse(priceValue, out decimal price) || price < 0)
                    {
                        errors.Add($"Строка {row}: неверная цена '{priceValue}'");
                        continue;
                    }

                    if (!int.TryParse(quantityValue, out int quantity) || quantity < 0)
                    {
                        errors.Add($"Строка {row}: неверное количество '{quantityValue}'");
                        continue;
                    }

                    var productName = GetCellValue(currentRow.GetCell(0))?.Trim();
                    if (string.IsNullOrWhiteSpace(productName))
                    {
                        errors.Add($"Строка {row}: отсутствует название продукта");
                        continue;
                    }

                    var product = new Product
                    {
                        Name = productName,
                        Price = price,
                        Quantity = quantity,
                        BrandId = brandId
                    };

                    products.Add(product);
                }
            }

            // Если есть ошибки, выбрасываем исключение с их списком
            if (errors.Count > 0)
            {
                throw new InvalidOperationException($"Ошибки при импорте:\n{string.Join("\n", errors)}");
            }

            Console.WriteLine($"Успешно импортировано {products.Count} продуктов");
            return products;
        }

        private string GetCellValue(ICell cell)
        {
            if (cell == null) return string.Empty;

            switch (cell.CellType)
            {
                case CellType.String:
                    return cell.StringCellValue;
                case CellType.Numeric:
                    return cell.NumericCellValue.ToString();
                case CellType.Boolean:
                    return cell.BooleanCellValue.ToString();
                case CellType.Formula:
                    try
                    {
                        return cell.StringCellValue;
                    }
                    catch
                    {
                        return cell.NumericCellValue.ToString();
                    }
                default:
                    return string.Empty;
            }
        }
    }
}