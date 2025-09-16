using System;
using System.Collections.Generic;

namespace ReactApp.Server.Models;

public partial class Coin
{
    public int Id { get; set; }

    public int Value { get; set; }

    public int Quantity { get; set; }
}
