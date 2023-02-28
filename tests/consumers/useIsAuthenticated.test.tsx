import { InteractionStatus, Logger, stubbedPublicClientApplication } from "@azure/msal-browser";
import { render } from "@solidjs/testing-library";
import { Component } from "solid-js";
import { createStore } from "solid-js/store";
import { beforeEach, describe } from "vitest";
import { useIsAuthenticated } from "../../src/consumers/useIsAuthenticated";
import { IMsalReadContext, MsalContext, MsalContextType } from "../../src/MsalContext";
import { AccountIdentifiers } from "../../src/types/AccountIdentifiers";

describe("useIsAuthenticated", () => {
    const [msalReadContext, setMsalReadContext] = createStore<IMsalReadContext>({
        inProgress: InteractionStatus.None,
        accounts: [],
        activeAccount: null
    });

    const msalWriteContext = {
        instance: stubbedPublicClientApplication,
        logger: new Logger({})
    };

    const msalContext = (): MsalContextType => [msalReadContext, msalWriteContext];

    const EvaluatorComponent: Component<AccountIdentifiers> = (props) => {
        const [isAuthenticated] = useIsAuthenticated(props);

        const isAuthenticatedString = () => {
            const currentIsAuthenticated = isAuthenticated();

            return currentIsAuthenticated === undefined ? "undefined" : currentIsAuthenticated.toString();
        };

        return <>{isAuthenticatedString}</>;
    };

    const renderEvaluatorComponent = (accountIdentifiers?: AccountIdentifiers) =>
        render(() => (
            <MsalContext.Provider value={msalContext()}>
                <EvaluatorComponent {...accountIdentifiers} />
            </MsalContext.Provider>
        ));

    beforeEach(() => {
        setMsalReadContext({
            inProgress: InteractionStatus.None,
            accounts: [],
            activeAccount: null
        });
    });

    test("it should return undefined if the interaction status is Startup or SsoSilent", () => {
        const { container } = renderEvaluatorComponent();
        
        setMsalReadContext("inProgress", InteractionStatus.Startup);
        expect(container).toHaveTextContent("undefined");
        
        setMsalReadContext("inProgress", InteractionStatus.SsoSilent);
        expect(container).toHaveTextContent("undefined");
    });
    
    test("it should return true if no account identifiers are provided and there is at least one account", () => {
        const { container } = renderEvaluatorComponent();

        setMsalReadContext("accounts", [{
            homeAccountId: "homeAccountId",
            localAccountId: "localAccountId",
            environment: "environment",
            tenantId: "tenantId",
            username: "username"
        }]);
        expect(container).toHaveTextContent("true");
    });

    test("it should return false if no account identifiers are provided and there are no accounts", () => {
        const { container } = renderEvaluatorComponent();

        setMsalReadContext("accounts", []);
        expect(container).toHaveTextContent("false");
    });

    test("it should return true if there is a matching account with the provided account identifiers", () => {
        const { container } = renderEvaluatorComponent({
            homeAccountId: "homeAccountId",
            localAccountId: "localAccountId",
            username: "username"
        });

        setMsalReadContext("accounts", [{
            homeAccountId: "homeAccountId",
            localAccountId: "localAccountId",
            environment: "environment",
            tenantId: "tenantId",
            username: "username"
        }]);
        expect(container).toHaveTextContent("true");
    });

    test("it should return false if there is no matching account with the provided account identifiers", () => {
        const { container } = renderEvaluatorComponent({
            homeAccountId: "homeAccountId",
            localAccountId: "localAccountId",
            username: "username"
        });

        setMsalReadContext("accounts", [{
            homeAccountId: "homeAccountId2",
            localAccountId: "localAccountId2",
            environment: "environment",
            tenantId: "tenantId",
            username: "username2"
        }]);
        expect(container).toHaveTextContent("false");
    });
});
