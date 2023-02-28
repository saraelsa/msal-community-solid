import { InteractionStatus, stubbedPublicClientApplication } from "@azure/msal-browser";
import { describe, expect, test } from "vitest";
import { useMsal } from "../src/MsalContext";

describe("MsalContext", () => {
    test("it will default the read context to a blank state", () => {
        const [{ inProgress, accounts, activeAccount }] = useMsal();

        expect(inProgress).toBe(InteractionStatus.None);
        expect(accounts.length).toBe(0);
        expect(activeAccount).toBeNull();
    });

    test("it will default the write context's instance to the stubbed public client application", () => {
        const [_, { instance }] = useMsal();

        expect(instance).toBe(stubbedPublicClientApplication)
    });

    test("it will default the write context's logger to a default logger", () => {
        const [_, { logger }] = useMsal();

        expect(logger).not.toBeNull();
    });
});
