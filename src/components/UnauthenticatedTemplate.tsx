import { Component, JSX, Show } from "solid-js";
import { useIsAuthenticated } from "../consumers/useIsAuthenticated";
import { AccountIdentifiers } from "../types/AccountIdentifiers";

/**
 * Props for the {@link UnauthenticatedTemplate} component.
 */
export type UnauthenticatedTemplateProps = AccountIdentifiers & {
    children?: JSX.Element;
};

/**
 * Renders its children if the user is not authenticated.
 */
export const UnauthenticatedTemplate: Component<UnauthenticatedTemplateProps> = (props) => {
    const [isAuthenticated] = useIsAuthenticated(props);

    return (
        <Show when={isAuthenticated() === false}>
            {props.children}
        </Show>
    );
};
