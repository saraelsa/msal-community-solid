import { InteractionType, PopupRequest, RedirectRequest, SsoSilentRequest } from "@azure/msal-browser";

/**
 * A request to silently authenticate a user.
 */
export type SilentInteractionAuthenticationRequest = {
    interactionType: InteractionType.Silent;
    authenticationRequest?: SsoSilentRequest;
};

/**
 * A request to authenticate a user using a popup.
 */
export type PopupInteractionAuthenticationRequest = {
    interactionType: InteractionType.Popup;
    authenticationRequest?: PopupRequest;
};

/**
 * A request to authenticate a user using a redirect.
 */
export type RedirectInteractionAuthenticationRequest = {
    interactionType: InteractionType.Redirect;
    authenticationRequest?: RedirectRequest;
};

/**
 * A request to authenticate a user.
 */
export type InteractionAuthenticationRequest =
    | SilentInteractionAuthenticationRequest
    | PopupInteractionAuthenticationRequest
    | RedirectInteractionAuthenticationRequest;
