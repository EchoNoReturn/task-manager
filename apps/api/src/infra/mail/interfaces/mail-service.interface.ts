export interface SendMailOptions {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
}

export interface IMailService {
  send(options: SendMailOptions): Promise<void>;

  sendTemplate(
    to: string | string[],
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<void>;
}
