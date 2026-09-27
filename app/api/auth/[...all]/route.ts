import { auth } from "../../../../src/lib/auth"; // Ajuste o caminho de importação se necessário
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
