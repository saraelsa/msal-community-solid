/*
 * Source: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/src/types/AccountIdentifiers.ts
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AccountInfo } from "@azure/msal-browser";

/**
 * An object containing identifying information for an account.
 */
export type AccountIdentifiers = Partial<Pick<AccountInfo, "homeAccountId" | "localAccountId" | "username">>;
