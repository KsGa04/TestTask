using ReactApp.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace ReactApp.Server.Services.Interfaces
{
    public interface IExcelImportService
    {
        Task<List<Product>> ImportProductsFromExcel(IFormFile file);
    }
}