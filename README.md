# React (with Redux) App with Azure AD Auth and .Net Core API
If you are developing Single Page App (SPA) in React and the backend leverages .NET Core APIs and you want to secure the backend APIs using Azure AD, this repo can be used as your starter project. Since client in this case is a React based SPA, I am using [OAuth2 implicit grant flow in Azure Active Directory (AD)](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-dev-understanding-oauth2-implicit-grant)

I used [Microsoft ASP.NET Core JavaScript Services](https://github.com/aspnet/JavaScriptServices) as my base project and did two things:

1. Secured the backend API Controller with Azure AD Authentication. The client needs to present valid OAuth2 bearer JWT tokens while making a request 
2. Integrated [ADAL JS](https://github.com/AzureAD/azure-activedirectory-library-for-js) with React such that, if user has NOT logged in with Azure AD, (s)he would be redirected to Azure AD Login page, before user can see index.html page of the SPA

## Register Apps with Azure AD
First, you need to register your backend APIs and Client Application with Azure AD. If you have not done it before, I recommend reading [Authentication Scenarios for Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-authentication-scenarios), expecially the "Single Page Application (SPA)" section. As described in Azure AD documentation, when you register the client app, keep following in mind:
1. Register it as **Native** (Application Type) App
2. After registration is completed, open Manifest file in Azure AD Portal, and set "oauth2AllowImplicitFlow:true"
3. The Reply URL will be https://localhost:xxxxx/auth, where xxxx represents your local port where the application runs
4. Make a note of "App ID URI", you will need while setting up config files for the application


Similarly, while registering the app for Backend APIs, keep following in mind:
1. Register it as **Web app / API** (Application Type)
2. Make a note of clientID and Redirect URL, you will need while setting up config files for the application

## Add Config Files

Next, you need to create **adalConfig.ts** file under /ClientApp/adal folder in the folder structure and put following code in it:

```javascript
const adalConfig = {
  tenant: '[YOUR TENANT NAME].onmicrosoft.com',
  clientId: '[CLIENT ID OF AZURE AD REGISTERED CLIENT APP]',
  extraQueryParameter: 'nux=1',
  endpoints: {
    '/api/': '["APP ID URI" OF REGISTERED BACKEND API]'
  },
  postLogoutRedirectUri: window.location.origin,
  redirectUri: '[REDIRECT URI OF AZURE AD REGISTERED CLIENT APP]',
  cacheLocation: 'sessionStorage'
};

export default adalConfig;
```
Of course, you need to replace values in square brackets with the values obtained from your Azure AD App registrations.

Also, add **azureAd.authConfig.json** file at the root of the project (along with appsettings.json file) and put following in it:

```json
{
  "Authentication": {
    "AzureAd": {
      "AADInstance": "https://login.microsoftonline.com/",
      "Audience": "['APP ID URI' OF REGISTERED BACKEND API]",
      "TenantId": "[Your tenant ID in the form of GUID]"
    }
  }
}
```
## Ready to Go!
Now, open the **.csproj** from in VS.NET (2015/2017) and run the starter project. If everything is configured properly, you should be redirected to Azure AD login page. After successful login, you will be taken to index.html of the SPA.

Also note that ADAL JS should auto-renew the tokens behind the scene so you should not worry about logging in again after few minutes. 

## Contact
If starter project is not working as described here, or you have additional questions or need a hand to set it up, do not hesitate to contact me @ [ashishqs@gmail.com](mailto:ashishqs@gmail.com) 