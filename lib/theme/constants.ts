/** Cookie de preferência de tema do shell interno (Procreating OS) — não confundir com
 *  `ADMIN_SESSION_COOKIE` (sessão). Não-`httpOnly` seria desnecessário: só o servidor grava (via
 *  `setThemeAction`) e lê (`app/(internal)/layout.tsx`, pra renderizar já no tema certo, sem
 *  flash); o cliente nunca precisa ler o valor bruto do cookie, só o estado do `ThemeProvider`. */
export const OS_THEME_COOKIE = "os_theme";
