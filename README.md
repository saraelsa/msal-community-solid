# msal-community-solid

The msal-community-solid package provides an authentication solution for Solid.js single-page applications (SPAs) based on the Microsoft Identity Platform. The platform supports sign-in through Azure Active Directory, allowing sign-in with Microsoft accounts as well as Azure AD accounts; and Azure Active Directory B2C, which is a white-labeled and highly customizable authentication solution supporting local as well as social accounts.

## Experimental Status

This package is currently experimental, meaning all APIs are subject to change. This is to simplify the process of improving the APIs based on community needs and feedback.

Suggestions and feedback on this package are welcome and encouraged—please raise a GitHub issue to provide your input.


## msal-browser

This package functions as a wrapper around the [msal-browser](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/master/lib/msal-browser) library, and the documentation for the library will apply here as well.

## Basic Usage

### Installation

Install the packages `msal-community-solid` and `@azure/msal-browser`.

```bash
# with pnpm
pnpm add msal-community-solid @azure/msal-browser
```

### MSAL Instance Setup

Create a `PublicClientApplication` (see the documentation for msal-browser for more details on how to do that):

```ts
import { Configuration, IPublicClientApplication, PublicClientApplication } from "@azure/msal-browser";

const msalConfig: Configuration = {
    auth: {
        clientId: "MY_CLIENT_ID",
        authority: "https://login.microsoftonline.com/common/",
        redirectUri: "https://my-application.example.com/"
    },
    cache: {
        cacheLocation: "localStorage"
    }
};

const msalInstance: IPublicClientApplication = new PublicClientApplication(msalConfig);
```

Refer to [the documentation for configuring msal-browser](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md) to see how you can configure your application. In addition, refer to [msal-browser's documentation for working with Azure AD B2C](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/working-with-b2c.md) if you want to use Azure AD B2C.

You will need to register your app using the Azure Portal (or with an alternate way of accessing Azure such as the CLI).

### MSAL Provider

Set up the MSAL provider passing it the MSAL instance you created. All components that need reactive access to authentication state should be descendants of the MSAL provider.

```tsx
import { MsalProvider } from "msal-community-solid";

const MyApp: Component = () => {
    return (
        <MsalProvider instance={msalInstance}>
            <MyChild />
        </MsalProvider>
    );
};
```

The MSAL provider will handle initializing the MSAL instance. It will also handle incoming replies from OIDC/OAuth2 flows.

### Usage

Within a child component of the provider, you can access the MSAL context with `useMsal`.

It returns a tuple composed of a read context and a write context.

The read context allows you to access MSAL's current interaction status, a list of all available accounts, and the currently active account. It is a Solid.js store, and you should follow the same rules as you would with other stores to avoid losing reactivity.

The write context allows you to access the actual MSAL instance and logger. Despite its name, you can still read from it—but keep in mind that reads here will not be reactive.

You can also use the `useIsAuthenticated` consumer to determine whether the user is authenticated or not, and the `AuthenticatedTemplate` and `UnauthenticateTemplate` components to conditionally display their children depending on user's authentication status.

### Logging In, Out and Acquiring Tokens

You can directly use the MSAL instance (available in the write context returned by `useMsal`) to [log users in](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/login-user.md) and [out](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/logout.md), and to [acquire tokens](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/acquire-token.md).

## Further Documentation

The public API of this library includes documentation comments which can be referred to for more information.

## An example component

```tsx
import {
    createEffect,
    createResource,
    createMemo,
} from 'solid-js'

import { useMsal } from "msal-community-solid";
import { SilentRequest } from '@azure/msal-browser';


export function ExampleComponent() {
    
    const [readContext, writeContext] = useMsal()

    createEffect(() => {
        writeContext.instance.setActiveAccount(readContext.accounts[0])
    })

    const tokenRequestConfig = createMemo(() => ({
        scopes: msalConfig.scopes,
        redirectUri: msalConfig.auth.redirectUri,
        authority: msalConfig.auth.authority,
        account: readContext.activeAccount,
        forceRefresh: false,
        cacheLookupPolicy: 1,
        prompt: "none"
    } satisfies SilentRequest))


    async function fetchJwtToken(silentRequest: SilentRequest) {
        try {
            return await writeContext.instance.acquireTokenSilent(silentRequest)

        } catch (error) {

            if (error instanceof InteractionRequiredAuthError) {
                await writeContext.instance.acquireTokenRedirect(tokenRequestConfig)
                return await writeContext.instance.acquireTokenSilent(tokenRequestConfig)
            }
        }
    }

    const [responseJwt] = createResource(
        tokenRequestConfig,
        fetchJwtToken
    )

    // return (
    //     // Add your render code here
    // )
}
```