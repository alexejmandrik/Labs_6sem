using Ocelot.LoadBalancer.Interfaces;
using Ocelot.Responses;
using Ocelot.Values;

public class CustomBalancer : ILoadBalancer
{
    private readonly List<ServiceHostAndPort> _services;
    private readonly Random _random = new();

    public string Type => "CustomBalancer";

    public CustomBalancer(List<ServiceHostAndPort> services)
    {
        _services = services;
    }

    public Task<Response<ServiceHostAndPort>> LeaseAsync(HttpContext httpContext)
    {
        var r = _random.Next(100);

        ServiceHostAndPort selected;

        if (r < 50)
            selected = _services[0]; // X
        else if (r < 80)
            selected = _services[1]; // Y
        else
            selected = _services[2]; // Z

        return Task.FromResult<Response<ServiceHostAndPort>>(
            new OkResponse<ServiceHostAndPort>(selected)
        );
    }

    public void Release(ServiceHostAndPort service)
    {
        // ничего не делаем
    }
}