import {
    AccountInfo,
    InteractionStatus,
    IPublicClientApplication,
    Logger,
    stubbedPublicClientApplication
} from "@azure/msal-browser";
import { createContext, useContext } from "solid-js";

/**
 * The read-only context for MSAL.
 *
 * @remarks
 * This can be used to reactively read the current state of MSAL.
 */
export interface IMsalReadContext {
    inProgress: InteractionStatus;
    accounts: AccountInfo[];
    activeAccount: AccountInfo | null;
}

/**
 * The writeable context for MSAL.
 *
 * @remarks
 * Reads from this context are not reactive.
 */
export interface IMsalWriteContext {
    instance: IPublicClientApplication;
    logger: Logger;
}

/**
 * Tuple representing the context for MSAL, composed from {@link IMsalReadContext} and {@link IMsalWriteContext}.
 */
export type MsalContextType = [IMsalReadContext, IMsalWriteContext];

/**
 * The stubbed context for the MSAL provider.
 *
 * The read context is defaulted to blank, and the write context is defaulted to the stubbed MSAL client which will
 * throw an error on write operations.
 */
export const stubbedMsalContext: MsalContextType = [
    {
        inProgress: InteractionStatus.None,
        accounts: [],
        activeAccount: null
    },
    {
        instance: stubbedPublicClientApplication,
        logger: new Logger({})
    }
];

/**
 * The Solid context for MSAL.
 */
export const MsalContext = createContext<MsalContextType>(stubbedMsalContext);

/**
 * Allows accessing the MSAL context.
 *
 * @returns The MSAL context.
 */
export const useMsal = (): MsalContextType => useContext(MsalContext);
