const parseMessageForwardingCommand = require("../src/parse-message-forwarding-command");

const ellie = { shortcode: "e" };
const nora = { shortcode: "n" };
const identities = [ellie, nora];

describe("parseMessageForwardingCommand", () => {
    it("parses basic message string", () => {
        const { identity, body } = parseMessageForwardingCommand(
            "e hi friends!",
            identities
        );

        expect(identity).toBe(ellie);
        expect(body).toEqual("hi friends!");
    });

    it("handles emojis", () => {
        const { identity, body } = parseMessageForwardingCommand(
            "e hi friends! 😍",
            identities
        );

        expect(identity).toBe(ellie);
        expect(body).toEqual("hi friends! 😍");
    });

    it("handles multi-line messages", () => {
        const { identity, body } = parseMessageForwardingCommand(
            "e hi friends!\nhow are you?",
            identities
        );

        expect(identity).toBe(ellie);
        expect(body).toEqual("hi friends!\nhow are you?");
    });

    it("returns null if identity not found", () => {
        const parsedMessage = parseMessageForwardingCommand(
            "v hi friends!",
            identities
        );

        expect(parsedMessage).toBe(null);
    });

    it("returns null if not formatted correctly (single-word message)", () => {
        const parsedMessage = parseMessageForwardingCommand(
            "hmmmm",
            identities
        );

        expect(parsedMessage).toBe(null);
    });
});
