FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY src-cs/ModusClient.Web/ModusClient.Web.csproj src-cs/ModusClient.Web/
COPY src-cs/ModusClient.Core/ModusClient.Core.csproj src-cs/ModusClient.Core/
COPY src-cs/ModusClient.Contracts/ModusClient.Contracts.csproj src-cs/ModusClient.Contracts/
COPY src-cs/ModusClient.Protocols/ModusClient.Protocols.csproj src-cs/ModusClient.Protocols/
COPY src-cs/ModusClient.Native/ModusClient.Native.csproj src-cs/ModusClient.Native/
COPY src-cs/ModusClient.App/ModusClient.App.csproj src-cs/ModusClient.App/

RUN dotnet restore src-cs/ModusClient.Web/ModusClient.Web.csproj

COPY src-cs/ src-cs/
COPY dllCTR dllCTR/
COPY dllDLMS dllDLMS/
COPY dllGenius dllGenius/
RUN dotnet publish src-cs/ModusClient.Web/ModusClient.Web.csproj -c Release -o /app/publish --no-restore

COPY src-cs/ModusClient.Web/wwwroot /app/publish/wwwroot

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
EXPOSE 4059
ENTRYPOINT ["dotnet", "ModusClient.Web.dll"]