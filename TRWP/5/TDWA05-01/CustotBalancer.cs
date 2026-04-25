using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Ocelot.Configuration;
using Ocelot.DependencyInjection;
using Ocelot.LoadBalancer.Interfaces;
using Ocelot.Responses;
using Ocelot.ServiceDiscovery.Providers;
using Ocelot.Values;

public class CustomBalancer : ILoadBalancer
{
    private readonly Func<Task<List<Service>>> _services;
    private readonly List<ServiceHostAndPort> _routeHosts;
    private readonly Random _random = new();

    public string Type => nameof(CustomBalancer);

    public CustomBalancer()
        : this(() => Task.FromResult(new List<Service>()), new List<ServiceHostAndPort>())
    {
    }

    public CustomBalancer(Func<Task<List<Service>>> services, List<ServiceHostAndPort> routeHosts)
    {
        _services = services;
        _routeHosts = routeHosts;
    }

    public async Task<Response<ServiceHostAndPort>> LeaseAsync(HttpContext httpContext)
    {
        var services = await _services();
        var hosts = services.Select(s => s.HostAndPort).ToList();
        if (hosts.Count == 0)
        {
            hosts = _routeHosts;
        }
        if (hosts.Count == 0)
        {
            hosts = TryGetHostsFromContext(httpContext);
        }

        if (hosts.Count == 0)
        {
            throw new InvalidOperationException("No downstream services are available for CustomBalancer.");
        }

        // 50% / 30% / 20%
        var value = _random.Next(1, 101);
        var index = value <= 50 ? 0 : value <= 80 ? 1 : 2;
        if (index >= hosts.Count)
        {
            index = hosts.Count - 1;
        }

        return new OkResponse<ServiceHostAndPort>(hosts[index]);
    }

    public void Release(ServiceHostAndPort hostAndPort)
    {
    }

    private static List<ServiceHostAndPort> TryGetHostsFromContext(HttpContext httpContext)
    {
        var result = new List<ServiceHostAndPort>();
        if (!httpContext.Items.TryGetValue("DownstreamRoute", out var downstreamRouteObj) || downstreamRouteObj is null)
        {
            return result;
        }

        var routeType = downstreamRouteObj.GetType();
        var addressesProp = routeType.GetProperty("DownstreamAddresses");
        var addresses = addressesProp?.GetValue(downstreamRouteObj) as System.Collections.IEnumerable;
        if (addresses is null)
        {
            return result;
        }

        foreach (var address in addresses)
        {
            if (address is null)
            {
                continue;
            }

            var addressType = address.GetType();
            var host = addressType.GetProperty("Host")?.GetValue(address) as string;
            var portObj = addressType.GetProperty("Port")?.GetValue(address);
            if (string.IsNullOrWhiteSpace(host) || portObj is null)
            {
                continue;
            }

            result.Add(new ServiceHostAndPort(host, (int)portObj));
        }

        return result;
    }
}

public class CustomBalancerCreator : ILoadBalancerCreator
{
    public string Type => nameof(CustomBalancer);

    public Response<ILoadBalancer> Create(DownstreamRoute route, IServiceDiscoveryProvider serviceDiscoveryProvider)
    {
        var routeHosts = route.DownstreamAddresses?
            .Select(x => new ServiceHostAndPort(x.Host, x.Port))
            .ToList()
            ?? new List<ServiceHostAndPort>();
        return new OkResponse<ILoadBalancer>(new CustomBalancer(serviceDiscoveryProvider.GetAsync, routeHosts));
    }
}

public static class OcelotNamedServiceCompatibilityExtensions
{
    public static IServiceCollection AddSingletonNamedService<TService, TImplementation>(
        this IServiceCollection services,
        string name)
        where TService : class
        where TImplementation : class, TService
    {
        services.AddSingleton<TService, TImplementation>();
        return services;
    }
}