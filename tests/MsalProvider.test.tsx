import { EventMessage, InteractionStatus, IPublicClientApplication, PublicClientApplication, stubbedPublicClientApplication } from "@azure/msal-browser";
import { render, waitFor } from "@solidjs/testing-library";
import { Component, createEffect } from "solid-js";
import { describe, SpyInstance, test, vi } from "vitest";
import { useMsal } from "../src/MsalContext";
import { MsalProvider } from "../src/MsalProvider";
import { testMsalConfig } from "./testValues";

describe("MsalProvider", () => {
    let msalInstance: IPublicClientApplication;
    let eventCallbacks: { [key: string]: (eventMessage: EventMessage) => void } = {};
    let lastEventCallbackId: number = -1;

    let initializeSpy: SpyInstance<[], Promise<void>>;
    let handleRedirectSpy: SpyInstance;
    let addEventCallbackSpy: SpyInstance;
    let removeEventCallbackSpy: SpyInstance;

    beforeEach(() => {
        msalInstance = new PublicClientApplication(testMsalConfig);

        initializeSpy = vi.spyOn(msalInstance, "initialize").mockReturnValue(Promise.resolve());
        handleRedirectSpy = vi.spyOn(msalInstance, "handleRedirectPromise").mockReturnValue(Promise.resolve(null));
        addEventCallbackSpy = vi.spyOn(msalInstance, "addEventCallback").mockImplementation((eventCallback) => {
            const eventCallbackId: string = (++lastEventCallbackId).toString();

            eventCallbacks[eventCallbackId] = eventCallback as (eventMessage: EventMessage) => void;

            return eventCallbackId;
        });
        removeEventCallbackSpy = vi.spyOn(msalInstance, "removeEventCallback").mockImplementation((eventCallbackId) => {
            delete eventCallbacks[eventCallbackId];
        });
    });

    test("it will initialize the public client application at once", () => {
        render(() => <MsalProvider instance={msalInstance} />);

        expect(initializeSpy).toBeCalledTimes(1);
    });

    test("it will add an event callback at once", () => {
        render(() => <MsalProvider instance={msalInstance} />);
        
        expect(addEventCallbackSpy).toBeCalledTimes(1);
    });

    test("it will handle the redirect promise", async () => {
        render(() => <MsalProvider instance={msalInstance} />);
        
        await waitFor(() => expect(handleRedirectSpy).toBeCalledTimes(1));
    });

    test("it will remove the event callback when the component is unmounted", () => {
        render(() => <MsalProvider instance={msalInstance} />).unmount();
        
        expect(removeEventCallbackSpy).toBeCalledTimes(1);
        expect(removeEventCallbackSpy).toBeCalledWith((lastEventCallbackId).toString());
    });

    test("it will reset the interaction status when no event is emitted to bring it to none", async () => {
        let interactionStatus: InteractionStatus | undefined = undefined;

        const InteractionStatusReportingComponent: Component = () => {
            const [msalReadContext] = useMsal();

            createEffect(() => {
                interactionStatus = msalReadContext.inProgress;
            });

            return null;
        };

        render(() => (
            <MsalProvider instance={msalInstance}>
                <InteractionStatusReportingComponent />
            </MsalProvider>
        ));

        await waitFor(() => expect(interactionStatus).toBe(InteractionStatus.None));
    });
});
