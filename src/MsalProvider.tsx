import { EventMessage, EventMessageUtils, InteractionStatus, IPublicClientApplication } from "@azure/msal-browser";
import { Component, createMemo, createRenderEffect, createSignal, JSX, on, onCleanup, Show } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { IMsalReadContext, IMsalWriteContext, MsalContext, stubbedMsalContext } from "./MsalContext";
import { name as packageName, version as packageVersion } from "../package.json";
import { isServer } from "solid-js/web";

/**
 * Props for the {@link MsalProvider} component.
 */
export type MsalProviderProps = {
    instance: IPublicClientApplication;
    children?: JSX.Element;
};

/**
 * The server-side MSAL provider that does not initialize or use the MSAL instance.
 *
 * It will propagate a startup-state read context, which is similar to the initial read context on the client.
 */
export const ServerMsalProvider: Component<MsalProviderProps> = (props) => {
    const readContext: IMsalReadContext = {
        inProgress: InteractionStatus.Startup,
        accounts: [],
        activeAccount: null
    };

    const [_, writeContext] = stubbedMsalContext;

    return <MsalContext.Provider value={[readContext, writeContext]}>{props.children}</MsalContext.Provider>;
};

/**
 * The MSAL provider provides the MSAL context to its children.
 *
 * It will initialize the MSAL instance, create a reactive read context that is automatically updated using an
 * event listener added to the MSAL instance, and direct the MSAL instance to handle any redirect responses.
 *
 * It will not load its children until it has completed these initialization steps.
 *
 * On the server, it will fallback to the server-side MSAL provider {@link ServerMsalProvider}.
 */
export const MsalProvider: Component<MsalProviderProps> = (props) => {
    if (isServer) {
        return <ServerMsalProvider {...props} />;
    }

    const logger = createMemo(() => props.instance.getLogger().clone(packageName, packageVersion));

    const [isReady, setIsReady] = createSignal(false);

    const [readContext, setReadContext] = createStore<IMsalReadContext>({
        inProgress: InteractionStatus.Startup,
        accounts: [],
        activeAccount: null
    });

    const writeContext = (): IMsalWriteContext => ({
        instance: props.instance,
        logger: logger()
    });

    const reconcileReadContext = (interactionStatus: InteractionStatus) => {
        console.warn(`MsalProvider - reconciling read context with interaction status ${interactionStatus}.`);

        setReadContext(
            reconcile({
                inProgress: interactionStatus,
                accounts: props.instance.getAllAccounts(),
                activeAccount: props.instance.getActiveAccount()
            })
        );

        logger().verbose(`MsalProvider - reconciled read context.`);
    };

    const handleEvent = (eventMessage: EventMessage) => {
        logger().verbose(`MsalProvider - handling event ${eventMessage.eventType}.`);

        console.warn(eventMessage);

        const interactionStatus =
            EventMessageUtils.getInteractionStatusFromEvent(eventMessage, readContext.inProgress) ??
            readContext.inProgress;

        reconcileReadContext(interactionStatus);
    };

    createRenderEffect(
        on(
            () => props.instance,
            (instance) => {
                setIsReady(false);

                const eventCallbackId = instance.addEventCallback(handleEvent);
                logger().verbose(`MsalProvider - added event callback with id ${eventCallbackId}.`);

                if (eventCallbackId !== null) {
                    onCleanup(() => {
                        logger().verbose(`MsalProvider - removing event callback with id ${eventCallbackId}.`);
                        instance.removeEventCallback(eventCallbackId);
                    });
                }

                (async () => {
                    try {
                        await instance.initialize();
                        logger().verbose(`MsalProvider - initialized.`);

                        try {
                            const result = await instance.handleRedirectPromise();
                            if (result !== null) {
                                logger().info(`MsalProvider - handled redirect promise.`);
                            }
                        } catch (error) {
                            logger().error(`MsalProvider - error handling redirect promise: ${error}`);
                        } finally {
                            // Avoid being stuck in the startup state when no event is emitted that would cancel it.
                            if (readContext.inProgress === InteractionStatus.Startup) {
                                logger().info(`MsalProvider - resetting interaction status.`);
                                reconcileReadContext(InteractionStatus.None);
                            }
                        }
                    } finally {
                        setIsReady(true);
                        logger().info(`MsalProvider - ready.`);
                    }
                })();
            }
        )
    );

    return (
        <MsalContext.Provider value={[readContext, writeContext()]}>
            <Show when={isReady()}>{props.children}</Show>
        </MsalContext.Provider>
    );
};
