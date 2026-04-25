using Ocelot.DependencyInjection;
using Ocelot.LoadBalancer.Interfaces;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json");

builder.Services
    .AddOcelot(builder.Configuration)
    .AddCustomLoadBalancer<CustomBalancer>();

var app = builder.Build();

await app.UseOcelot();

app.Run();