import { Component, JSX, Show } from "solid-js";
import { useIsAuthenticated } from "../consumers/useIsAuthenticated";
import { AccountIdentifiers } from "../types/AccountIdentifiers";

/**
 * Props for the {@link AuthenticatedTemplate} component.
 */
export type AuthenticatedTemplateProps = AccountIdentifiers & {
    children?: JSX.Element;
};

/**
 * Renders its children if the user is authenticated.
 */
export const AuthenticatedTemplate: Component<AuthenticatedTemplateProps> = (props) => {
    const [isAuthenticated] = useIsAuthenticated(props);

    return <Show when={isAuthenticated() === true}>{props.children}</Show>;
};
