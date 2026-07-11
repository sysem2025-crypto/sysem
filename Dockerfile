FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY modus-api-publish/ /app/
EXPOSE 8080
EXPOSE 4059
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "ModusClient.Web.dll"]
