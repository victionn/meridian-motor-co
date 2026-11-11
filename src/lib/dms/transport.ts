import { Client } from "basic-ftp";
import { Writable } from "node:stream";

/** A file as listed on the stock server. `modified` is the server's own date text — compared, never trusted as a clock. */
export type RemoteFile = { name: string; size: number; modified: string };

/**
 * Read-only access to the server EasyCars pushes stock to. Kept behind an interface so a move to SFTP (or tests
 * with an in-memory server) only swaps this class. Implementations must never write, rename or delete.
 */
export interface StockTransport {
  /** Size and last-modified time of one file. */
  stat(path: string): Promise<{ size: number; modifiedAt: Date }>;
  download(path: string): Promise<Buffer>;
  list(dir: string): Promise<RemoteFile[]>;
  close(): void;
}

export type FtpConfig = { host: string; port: number; user: string; password: string; timeoutMs?: number };

export function ftpConfigFromEnv(env: NodeJS.ProcessEnv = process.env): FtpConfig {
  const { EASYCARS_FTP_HOST: host, EASYCARS_FTP_USER: user, EASYCARS_FTP_PASSWORD: password } = env;
  if (!host || !user || !password) throw new Error("EASYCARS_FTP_HOST, EASYCARS_FTP_USER and EASYCARS_FTP_PASSWORD must all be set");
  return { host, user, password, port: Number(env.EASYCARS_FTP_PORT ?? 21) };
}

/** Raised for anything that went wrong talking to the server, with the password scrubbed from the message. */
export class TransportError extends Error {}

/**
 * Plain FTP in passive mode over ONE connection, with every transfer sequential — the server is small and shared
 * with the old site. Paths are resolved against the login directory: the account is not jailed to its home, so a
 * leading "/" would otherwise mean the server's filesystem root.
 */
export class FtpTransport implements StockTransport {
  private client: Client;
  private home: string | undefined;

  constructor(private config: FtpConfig) {
    this.client = new Client(config.timeoutMs ?? 20_000);
  }

  private async run<T>(what: string, action: (home: string) => Promise<T>): Promise<T> {
    try {
      if (this.home === undefined) {
        // FTP is unencrypted on this server (no TLS offered); nothing sensitive is ever sent beyond the login.
        await this.client.access({ host: this.config.host, port: this.config.port, user: this.config.user, password: this.config.password, secure: false });
        this.home = await this.client.pwd();
      }
      return await action(this.home);
    } catch (err) {
      const message = String((err as Error).message ?? err).split(this.config.password).join("***");
      throw new TransportError(`FTP ${what} failed: ${message}`);
    }
  }

  private resolve(home: string, path: string) {
    return `${home.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
  }

  stat(path: string) {
    return this.run(`stat ${path}`, async (home) => {
      const full = this.resolve(home, path);
      return { size: await this.client.size(full), modifiedAt: await this.client.lastMod(full) };
    });
  }

  download(path: string) {
    return this.run(`download ${path}`, async (home) => {
      const chunks: Buffer[] = [];
      const sink = new Writable({
        write(chunk: Buffer, _encoding, done) {
          chunks.push(chunk);
          done();
        },
      });
      await this.client.downloadTo(sink, this.resolve(home, path));
      return Buffer.concat(chunks);
    });
  }

  list(dir: string) {
    return this.run(`list ${dir}`, async (home) => {
      const entries = await this.client.list(this.resolve(home, dir));
      return entries.filter((e) => e.isFile).map((e) => ({ name: e.name, size: e.size, modified: e.modifiedAt?.toISOString() ?? e.rawModifiedAt ?? "" }));
    });
  }

  close() {
    this.client.close();
  }
}
