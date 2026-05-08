import { InternalServerErrorException } from "@nestjs/common";
import { DeepgramClient } from "@deepgram/sdk";
import { DeepgramTokenService } from "./deepgram-token.service";

const mockGrant = jest.fn();

jest.mock("@deepgram/sdk", () => ({
  DeepgramClient: jest.fn(() => ({
    auth: {
      v1: {
        tokens: {
          grant: mockGrant,
        },
      },
    },
  })),
}));

describe("DeepgramTokenService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("grants a short-lived Deepgram browser token", async () => {
    process.env.DEEPGRAM_API_KEY = "server-api-key";
    mockGrant.mockResolvedValue({
      access_token: "browser-jwt",
      expires_in: 600,
    });

    await expect(new DeepgramTokenService().createToken()).resolves.toEqual({
      accessToken: "browser-jwt",
      expiresIn: 600,
    });

    expect(DeepgramClient).toHaveBeenCalledWith({ apiKey: "server-api-key" });
    expect(mockGrant).toHaveBeenCalledWith({ ttl_seconds: 600 });
  });

  it("requires DEEPGRAM_API_KEY", async () => {
    delete process.env.DEEPGRAM_API_KEY;

    await expect(new DeepgramTokenService().createToken()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );

    expect(DeepgramClient).not.toHaveBeenCalled();
  });

  it("surfaces TLS trust guidance when Deepgram token grant hits a self-signed certificate", async () => {
    process.env.DEEPGRAM_API_KEY = "server-api-key";
    mockGrant.mockRejectedValue({
      cause: {
        cause: {
          code: "SELF_SIGNED_CERT_IN_CHAIN",
        },
      },
    });

    try {
      await new DeepgramTokenService().createToken();
      throw new Error("Expected createToken to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect((error as InternalServerErrorException).getResponse()).toEqual({
        message:
          "Unable to create Deepgram streaming token because Node does not trust the TLS certificate chain. Configure NODE_EXTRA_CA_CERTS with your proxy/root CA certificate before starting the API.",
        code: "SELF_SIGNED_CERT_IN_CHAIN",
      });
    }
  });
});
