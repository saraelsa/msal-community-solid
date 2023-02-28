import { Accessor, createSignal, Setter } from "solid-js";
import { describe, test, SpyInstance, vi } from "vitest";
import { AccountIdentifiers } from "../../src/types/AccountIdentifiers";
import { render } from "@solidjs/testing-library";
import { UnauthenticatedTemplate } from "../../src/components/UnauthenticatedTemplate";
import * as useIsAuthenticatedModule from "../../src/consumers/useIsAuthenticated";

describe("UnauthenticatedTemplate", () => {
    let isAuthenticated: Accessor<boolean | undefined>;
    let setIsAuthenticated: Setter<boolean | undefined>;

    let useIsAuthenticatedSpy: SpyInstance<[accountIdentifiers?: AccountIdentifiers], [Accessor<boolean | undefined>]>;

    beforeEach(() => {
        [isAuthenticated, setIsAuthenticated] = createSignal(undefined);

        useIsAuthenticatedSpy = vi.spyOn(useIsAuthenticatedModule, "useIsAuthenticated").mockReturnValue([isAuthenticated]);
    });

    test("it should access useIsAuthenticated with the provided account identifiers", () => {
        const accountIdentifiers: AccountIdentifiers = {
            homeAccountId: "homeAccountId",
            localAccountId: "localAccountId",
            username: "username"
        };

        render(() => <UnauthenticatedTemplate {...accountIdentifiers} />);

        expect(useIsAuthenticatedSpy).toHaveBeenCalledWith(accountIdentifiers);
    });

    test("it should access useIsAuthenticated even if no account identifiers have been provided", () => {
        render(() => <UnauthenticatedTemplate />);

        expect(useIsAuthenticatedSpy).toHaveBeenCalled();
    });

    test("it should render its children when the user is not authenticated", () => {
        setIsAuthenticated(false);

        const { container } = render(() => <UnauthenticatedTemplate>Authenticated</UnauthenticatedTemplate>);

        expect(container).toHaveTextContent("Authenticated");
    });

    test("it should not render its children when the user is authenticated", () => {
        setIsAuthenticated(true);

        const { container } = render(() => <UnauthenticatedTemplate>Authenticated</UnauthenticatedTemplate>);

        expect(container).not.toHaveTextContent("Authenticated");
    });

    test("it should not render its children when there is no authentication result", () => {
        const { container } = render(() => <UnauthenticatedTemplate>Authenticated</UnauthenticatedTemplate>);

        expect(container).not.toHaveTextContent("Authenticated");
    });
});
