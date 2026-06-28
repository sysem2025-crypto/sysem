FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY ModusClient.Web/ModusClient.Web.csproj ModusClient.Web/
COPY ModusClient.Core/ModusClient.Core.csproj ModusClient.Core/
COPY ModusClient.Contracts/ModusClient.Contracts.csproj ModusClient.Contracts/
COPY ModusClient.Protocols/ModusClient.Protocols.csproj ModusClient.Protocols/
COPY ModusClient.Native/ModusClient.Native.csproj ModusClient.Native/
COPY ModusClient.App/ModusClient.App.csproj ModusClient.App/

RUN dotnet restore ModusClient.Web/ModusClient.Web.csproj

COPY . .
RUN dotnet publish ModusClient.Web/ModusClient.Web.csproj -c Release -o /app/publish --no-restore

# wwwroot non viene inclusa automaticamente nel publish
COPY ModusClient.Web/wwwroot /app/publish/wwwroot

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
EXPOSE 4059
ENTRYPOINT ["dotnet", "ModusClient.Web.dll"]