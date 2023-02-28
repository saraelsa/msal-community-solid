import { AccountInfo, InteractionStatus } from "@azure/msal-browser";
import { Accessor } from "solid-js";
import { useMsal } from "../MsalContext";
import { AccountIdentifiers } from "../types/AccountIdentifiers";

const matchProperty = (account: AccountInfo, accountIdentifiers: AccountIdentifiers, property: keyof AccountIdentifiers): boolean => {
    return accountIdentifiers[property] === undefined || account[property] === accountIdentifiers[property];
};

const matchAccount = (account: AccountInfo, accountIdentifiers: AccountIdentifiers): boolean => {
    return matchProperty(account, accountIdentifiers, "homeAccountId")
        && matchProperty(account, accountIdentifiers, "localAccountId")
        && matchProperty(account, accountIdentifiers, "username");
};

/**
 * A context consumer which identifies whether the user is authenticated or not.
 * 
 * @param accountIdentifiers - Optional account identifiers to match against.
 * @returns A boolean indicating whether the user is authenticated, or undefined if the authentication state is
 * currently indeterminate.
 */
export const useIsAuthenticated = (accountIdentifiers?: AccountIdentifiers): [Accessor<boolean | undefined>] => {
    const [msalReadContext] = useMsal();

    const isAuthenticated = () => {
        if (msalReadContext.inProgress === InteractionStatus.Startup
            || msalReadContext.inProgress === InteractionStatus.SsoSilent) {
            return undefined;
        } else if (accountIdentifiers !== undefined) {
            return msalReadContext.accounts.some(account => matchAccount(account, accountIdentifiers));
        } else {
            return msalReadContext.accounts.length > 0;
        }
    };

    return [isAuthenticated];
};
