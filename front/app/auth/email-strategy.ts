import crypto from "crypto-js";
import type { SessionStorage } from "react-router";
import { redirect } from "react-router";
import { Strategy } from "remix-auth/strategy";

export type SendEmailOptions<User> = {
  emailAddress: string;
  magicLink: string;
  domainUrl: string;
  form: FormData;
};

export type SendEmailFunction<User> = {
  (options: SendEmailOptions<User>): Promise<void>;
};

/**
 * Validate the email address the user is trying to use to login.
 * This can be useful to ensure it's not a disposable email address.
 * @param emailAddress The email address to validate
 */
export type VerifyEmailFunction = {
  (email: string): Promise<void>;
};

/**
 * The content of the magic link payload. Keys are minified so that the resulting link is as short as possible.
 */
export type MagicLinkPayload = {
  /**
   * Email address used to authenticate.
   */
  e: string;
  /**
   * Form data received in the request.
   */
  f?: Record<string, unknown>;
  /**
   * Creation date of the magic link, as an ISO string. This is used to check
   * the email link is still valid.
   */
  c: number;
};

/**
 * This interface declares the session data that is required for this package
 *  to store the following details.
 */
type MagicLinkSessionData<User> = {
  /**
   * The magic link URL that was sent to the user's email.
   */
  magicLink: string;
  /**
   * The email address used for authentication.
   */
  email: string;
  /**
   * The authenticated user object.
   */
  user: User;
};

/**
 * This interface declares the session flash data that is required for this package
 *  to store the following details.
 */
type MagicLinkSessionFlashData = {
  /**
   * The error message to display to the user.
   */
  error: string;
};

/**
 * This interface declares what configuration the strategy needs from the
 * developer to correctly work.
 */
export type EmailLinkStrategyOptions<User, SessionData, SessionFlashData> = {
  /**
   * The endpoint the user will go after clicking on the email link.
   * A whole URL is not required, the pathname is enough, the strategy will
   * detect the host of the request and use it to build the URL.
   * @default "/magic"
   */
  callbackURL?: string;
  /**
   * A function to send the email. This function should receive the email
   * address of the user and the URL to redirect to and should return a Promise.
   * The value of the Promise will be ignored.
   */
  sendEmail: SendEmailFunction<User>;
  /**
   * A function to validate the email address. This function should receive the
   * email address as a string and return a Promise. The value of the Promise
   * will be ignored, in case of error throw an error.
   *
   * By default it only test the email against the RegExp `/.+@.+/`.
   */
  verifyEmailAddress?: VerifyEmailFunction;
  /**
   * A secret string used to encrypt and decrypt the token and magic link.
   */
  secret: string;
  /**
   * The name of the form input used to get the email.
   * @default "email"
   */
  emailField?: string;
  /**
   * The param name the strategy will use to read the token from the email link.
   * @default "token"
   */
  magicLinkSearchParam?: string;
  /**
   * How long the magic link will be valid. Default to 30 minutes.
   * @default 1_800_000
   */
  linkExpirationTime?: number;
  /**
   * Add an extra layer of protection and validate the magic link is valid.
   * @default false
   */
  validateSessionMagicLink?: boolean;
  /**
   * The URL to redirect to after sending the email.
   */
  emailSentRedirect: string;
  /**
   * The URL to redirect to after successful authentication.
   */
  successRedirect: string;
  /**
   * The URL to redirect to after failed authentication.
   */
  failureRedirect: string;
  /**
   * The session storage to use for the strategy.
   */
  sessionStorage: SessionStorage<
    SessionData extends MagicLinkSessionData<User> ? SessionData : never,
    SessionFlashData extends MagicLinkSessionFlashData
      ? SessionFlashData
      : never
  >;
};

/**
 * This interface declares what the developer will receive from the strategy
 * to verify the user identity in their system.
 */
export type EmailLinkStrategyVerifyParams = {
  email: string;
  form: FormData;
  /**
   * True, if the verify callback is called after clicking on the magic link
   */
  magicLinkVerify: boolean;
};

const verifyEmailAddress: VerifyEmailFunction = async (email) => {
  if (!/.+@.+/u.test(email)) {
    throw new Error("A valid email is required.");
  }
};

export class EmailLinkStrategy<
  User,
  SessionData,
  SessionFlashData
> extends Strategy<User, EmailLinkStrategyVerifyParams> {
  public name = "email-link";

  private readonly emailField: string = "email";

  private readonly callbackURL: string;

  private readonly sendEmail: SendEmailFunction<User>;

  private readonly validateEmail: VerifyEmailFunction;

  private readonly secret: string;

  private readonly magicLinkSearchParam: string;

  private readonly linkExpirationTime: number;

  private readonly validateSessionMagicLink: boolean;

  private readonly emailSentRedirect: string;

  private readonly successRedirect: string;

  private readonly failureRedirect: string;

  private readonly sessionStorage: SessionStorage<
    SessionData extends MagicLinkSessionData<User> ? SessionData : never,
    SessionFlashData extends MagicLinkSessionFlashData
      ? SessionFlashData
      : never
  >;

  constructor(
    options: EmailLinkStrategyOptions<User, SessionData, SessionFlashData>,
    verify: Strategy.VerifyFunction<User, EmailLinkStrategyVerifyParams>
  ) {
    super(verify);
    this.sendEmail = options.sendEmail;
    this.callbackURL = options.callbackURL ?? "/magic";
    this.secret = options.secret;
    this.validateEmail = options.verifyEmailAddress ?? verifyEmailAddress;
    this.emailField = options.emailField ?? this.emailField;
    this.magicLinkSearchParam = options.magicLinkSearchParam ?? "token";
    this.linkExpirationTime = options.linkExpirationTime ?? 1000 * 60 * 30; // 30 minutes
    this.validateSessionMagicLink = options.validateSessionMagicLink ?? false;
    this.emailSentRedirect = options.emailSentRedirect;
    this.successRedirect = options.successRedirect;
    this.failureRedirect = options.failureRedirect;
    this.sessionStorage = options.sessionStorage;
  }

  public async authenticate(request: Request): Promise<User> {
    const session = await this.sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    const form = new URLSearchParams(await request.text());
    const formData = new FormData();

    // Convert the URLSearchParams to FormData
    for (const [name, value] of form) {
      formData.append(name, value);
    }

    // This should only be called in an action if it's used to start the login process
    if (request.method === "POST") {
      // get the email address from the request body
      const emailAddress = form.get(this.emailField);

      // if it doesn't have an email address,
      if (!emailAddress || typeof emailAddress !== "string") {
        const message = "Missing email address.";
        session.flash("error", message);
        const cookie = await this.sessionStorage.commitSession(session);
        throw redirect(this.failureRedirect, {
          headers: { "Set-Cookie": cookie },
        });
      }

      try {
        // Validate the email address
        await this.validateEmail(emailAddress);

        const domainUrl = this.getDomainURL(request);

        const magicLink = await this.sendToken(
          emailAddress,
          domainUrl,
          formData
        );

        session.set("magicLink", await this.encrypt(magicLink));
        session.set("email", emailAddress);

        throw redirect(this.emailSentRedirect, {
          headers: {
            "Set-Cookie": await this.sessionStorage.commitSession(session),
          },
        });
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).status === 302) {
          // If it's a redirect, then just throw the redirect as it is
          throw error;
        }
        const { message } = error as Error;
        session.flash("error", message);
        const cookie = await this.sessionStorage.commitSession(session);
        throw redirect(this.failureRedirect, {
          headers: { "Set-Cookie": cookie },
        });
      }
    }

    let user: User;

    try {
      // If we get here, the user clicked on the magic link inside email
      const magicLink = session.get("magicLink") ?? "";
      const { emailAddress: email, form } = await this.validateMagicLink(
        request.url,
        await this.decrypt(magicLink as string)
      );
      
      // now that we have the user email we can call verify to get the user
      user = await this.verify({ email, form, magicLinkVerify: true });
    } catch (error) {
      const { message } = error as Error;
      session.flash("error", message);
      const cookie = await this.sessionStorage.commitSession(session);
      throw redirect(this.failureRedirect, {
        headers: { "Set-Cookie": cookie },
      });
    }

    // remove the magic link and email from the session
    session.unset("magicLink");
    session.unset("email");

    session.set("user", user);
    const cookie = await this.sessionStorage.commitSession(session);
    throw redirect(this.successRedirect, {
      headers: { "Set-Cookie": cookie },
    });
  }

  public async getMagicLink(
    emailAddress: string,
    domainUrl: string,
    form: FormData
  ): Promise<string> {
    const payload = this.createMagicLinkPayload(emailAddress, form);
    const stringToEncrypt = JSON.stringify(payload);
    const encryptedString = await this.encrypt(stringToEncrypt);
    const url = new URL(domainUrl);
    url.pathname = this.callbackURL;
    url.searchParams.set(this.magicLinkSearchParam, encryptedString);
    return url.toString();
  }

  private getDomainURL(request: Request): string {
    const host =
      request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

    if (!host) {
      throw new Error("Could not determine domain URL.");
    }

    const protocol =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? "http"
        : request.headers.get("X-Forwarded-Proto") ?? "https";

    return `${protocol}://${host}`;
  }

  private async sendToken(email: string, domainUrl: string, form: FormData) {
    const magicLink = await this.getMagicLink(email, domainUrl, form);

    await this.sendEmail({
      emailAddress: email,
      magicLink,
      domainUrl,
      form,
    });

    return magicLink;
  }

  private createFormPayload(form: FormData): MagicLinkPayload["f"] {
    const formKeys = [...form.keys()];
    return formKeys.length === 1
      ? undefined
      : Object.fromEntries(
          formKeys
            .filter((key) => key !== this.emailField)
            .map((key) => [
              key,
              form.getAll(key).length > 1 ? form.getAll(key) : form.get(key),
            ])
        );
  }

  private createMagicLinkPayload(
    emailAddress: string,
    form: FormData
  ): MagicLinkPayload {
    const formPayload = this.createFormPayload(form);
    return {
      e: emailAddress,
      ...(formPayload && { f: formPayload }),
      c: Date.now(),
    };
  }

  private async encrypt(value: string): Promise<string> {
    return crypto.AES.encrypt(value, this.secret).toString();
  }

  private async decrypt(value: string): Promise<string> {
    const bytes = crypto.AES.decrypt(value, this.secret);
    return bytes.toString(crypto.enc.Utf8);
  }

  private getMagicLinkCode(link: string) {
    try {
      const url = new URL(link);
      return url.searchParams.get(this.magicLinkSearchParam) ?? "";
    } catch {
      return "";
    }
  }

  private async validateMagicLink(
    requestUrl: string,
    sessionMagicLink?: string
  ) {
    const linkCode = this.getMagicLinkCode(requestUrl);
    const sessionLinkCode = sessionMagicLink
      ? this.getMagicLinkCode(sessionMagicLink)
      : null;

    let emailAddress;
    let linkCreationTime;
    let form: Record<string, unknown>;
    try {
      const decryptedString = await this.decrypt(linkCode);
      const payload = JSON.parse(decryptedString) as MagicLinkPayload;
      emailAddress = payload.e;
      form = payload.f ?? {};
      form[this.emailField] = emailAddress;
      linkCreationTime = payload.c;
    } catch (error: unknown) {
      console.error(error);
      throw new Error("Sign in link invalid. Please request a new one.");
    }

    if (typeof emailAddress !== "string") {
      throw new TypeError("Sign in link invalid. Please request a new one.");
    }

    if (this.validateSessionMagicLink) {
      if (!sessionLinkCode) {
        throw new Error("Sign in link invalid. Please request a new one.");
      }
      if (linkCode !== sessionLinkCode) {
        throw new Error(
          `You must open the magic link on the same device it was created from for security reasons. Please request a new link.`
        );
      }
    }

    if (typeof linkCreationTime !== "number") {
      throw new TypeError("Sign in link invalid. Please request a new one.");
    }

    const expirationTime = linkCreationTime + this.linkExpirationTime;
    if (Date.now() > expirationTime) {
      throw new Error("Magic link expired. Please request a new one.");
    }
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (Array.isArray(form[key])) {
        (form[key] as unknown[]).forEach((value) => {
          formData.append(key, value as string | Blob);
        });
      } else {
        formData.append(key, form[key] as string | Blob);
      }
    });
    return { emailAddress, form: formData };
  }
}
