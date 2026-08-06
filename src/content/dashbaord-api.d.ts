interface messageData_base<TAction extends string, T = any> {
    action: TAction;
    source: "yt-ext-request" | "yt-ext-response";
    requestId: string;
    token?: string;
    data?: T | { error: string };
}

type messageData =
    messageData_base<"getPlaylistArrayFromBackend", string[]> |
    messageData_base<"someOtherAction", { test: number }>;